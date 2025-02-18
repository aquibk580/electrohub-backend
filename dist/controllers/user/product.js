import { db } from "../../lib/db.js";
import { z } from "zod";
import { validateFile } from "../../lib/validateFile.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
const extractPublicId = (url) => {
    const parts = url.split("/");
    const publicIdwithExtension = parts[parts.length - 1];
    return publicIdwithExtension.split(".")[0];
};
// Get all products
async function getAllProducts(req, res) {
    try {
        const products = await db.product.findMany({
            include: { images: true, productInfo: true, reviews: true },
        });
        if (products.length === 0) {
            res.status(404).json({ error: "No products available" });
            return;
        }
        res.status(200).json({ products });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_GETTING_PRODUCT", error);
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
const reviewSchema = z.object({
    content: z.string().min(1, "Review content is required"),
    rating: z
        .string()
        .min(1, "rating must be at least 1")
        .max(5, "Rating cannot exceed five"),
});
// review a product
async function sendReview(req, res) {
    try {
        const { productId } = req.params;
        const parsedProductId = parseInt(productId, 10);
        if (isNaN(parsedProductId)) {
            res.status(400).json({ error: "Invalid or missing product Id" });
            return;
        }
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        const reviewData = await reviewSchema.parse(req.body);
        const { rating, content } = reviewData;
        const parsedRating = parseInt(rating, 10);
        const review = await db.review.create({
            data: {
                content,
                rating: parsedRating,
                productId: parsedProductId,
                userId: parsedUserId,
            },
        });
        const imageDatas = [];
        if (req.files) {
            const images = req.files;
            for (const image of images) {
                validateFile(image);
                const imageUrl = await uploadToCloudinary(image.buffer, process.env.REVIEW_FOLDER);
                imageDatas.push({
                    url: imageUrl,
                    reviewId: review.id,
                });
            }
            await db.reviewImage.createMany({
                data: imageDatas,
            });
        }
        res.status(201).json({
            message: "Review added successfully",
            review,
            images: imageDatas,
        });
    }
    catch (error) {
        console.error("ERROR_WHILE_SENDING_REVIEW", error);
        if (error.name === "ZodError") {
            res.status(400).json({ errors: error.errors });
            return;
        }
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
// Delete a specific review
async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;
        const parsedReviewId = parseInt(reviewId, 10);
        if (isNaN(parsedReviewId)) {
            res.status(400).json({ error: "Invalid or missing review Id" });
            return;
        }
        const review = await db.review.findUnique({
            where: {
                id: parsedReviewId,
            },
        });
        if (!review) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        const reviewImages = await db.reviewImage.findMany({
            where: {
                reviewId: parsedReviewId,
            },
        });
        if (reviewImages.length > 0) {
            for (const image of reviewImages) {
                const imagePublicId = extractPublicId(image.url);
                await cloudinary.uploader.destroy(imagePublicId);
            }
            await db.reviewImage.deleteMany({
                where: {
                    reviewId: parsedReviewId,
                },
            });
        }
        await db.review.delete({
            where: {
                id: parsedReviewId,
            },
        });
        res.status(200).json({ message: "Review deleted successfully", review });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_DELETING_REVIEW", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
}
const reveiewUpdateSchema = z.object({
    content: z
        .string()
        .min(1, "Content must be at least 1 charcater long ")
        .optional(),
    rating: z
        .string()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .optional(),
});
// Update a specific review
async function updateReveiw(req, res) {
    try {
        const { reviewId } = req.params;
        const ReviewId = parseInt(reviewId, 10);
        if (isNaN(ReviewId)) {
            res.status(400).json({ error: "Invalid or missing product ID." });
            return;
        }
        const review = await db.review.findUnique({
            where: { id: ReviewId },
            include: { ReviewImage: true },
        });
        if (!review) {
            res.status(404).json({ error: "Review not found." });
            return;
        }
        const validatedData = await reveiewUpdateSchema.parse(req.body);
        const updatedReviewData = Object.fromEntries(Object.entries(validatedData).filter(([_, value]) => value !== undefined));
        const uploadedFiles = req.files;
        const newImageUrls = await Promise.all(uploadedFiles.map(async (file) => {
            validateFile(file);
            return await uploadToCloudinary(file.buffer, process.env.REVIEW_FOLDER);
        }));
        await Promise.all(newImageUrls.map(async (url) => {
            await db.reviewImage.create({
                data: {
                    url,
                    reviewId: ReviewId,
                },
            });
        }));
        const updatedReview = await db.review.update({
            where: { id: ReviewId },
            data: updatedReviewData,
            include: { ReviewImage: true },
        });
        res.status(200).json({
            message: "Review updated successfully.",
            product: updatedReview,
        });
    }
    catch (error) {
        console.error("ERROR_WHILE_UPDATING_REVIEW", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
}
// Delete a single review image
async function deleteReviewImage(req, res) {
    try {
        const { imageId } = req.params;
        const image = await db.reviewImage.findUnique({
            where: { id: parseInt(imageId, 10) },
        });
        if (!image) {
            res.status(404).json({ error: "Image not found." });
            return;
        }
        const imagePublicId = extractPublicId(image.url);
        await cloudinary.uploader.destroy(`${process.env.PRODUCT_FOLDER}/${imagePublicId}`);
        await db.reviewImage.delete({ where: { id: image.id } });
        res.status(200).json({ message: "Review image deleted successfully." });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { getAllProducts, sendReview, deleteReview, updateReveiw, deleteReviewImage, };
