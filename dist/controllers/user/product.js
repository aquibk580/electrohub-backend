import { db } from "../../lib/db.js";
import { z } from "zod";
// Get all products
async function getAllProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const skip = (page - 1) * limit;
        const whereClause = category && category !== "All" ? { categoryName: category } : {};
        const products = await db.product.findMany({
            where: whereClause && {
                status: {
                    in: ["OutOfStock", "Active"],
                },
            },
            orderBy: { createdAt: "desc" },
            include: { images: true, productInfo: true, reviews: true },
            skip,
            take: limit,
        });
        const totalProducts = await db.product.count({ where: whereClause });
        res.status(200).json({ products, total: totalProducts });
    }
    catch (error) {
        console.error("ERROR_WHILE_GETTING_PRODUCT", error);
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
// Get single product of a single seller
async function getSingleProduct(req, res) {
    try {
        const { productId } = req.params;
        const ProductId = parseInt(productId, 10);
        if (isNaN(ProductId)) {
            res.status(400).json({ error: "Missing or Invalid product id" });
            return;
        }
        const product = await db.product.findUnique({
            where: {
                id: ProductId,
            },
            include: {
                images: true,
                productInfo: true,
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(200).json(product);
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
const reviewSchema = z.object({
    content: z
        .string()
        .trim()
        .min(5, "Review content must be at least 5 characters")
        .max(1000, "Review content cannot exceed 1000 characters"),
    rating: z.number(),
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
        const review = await db.review.create({
            data: {
                content,
                rating: rating,
                productId: parsedProductId,
                userId: parsedUserId,
            },
        });
        res.status(201).json({
            message: "Review added successfully",
            review,
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
// Get all reviews of a specific user
async function getUserReviews(req, res) {
    try {
        const userId = parseInt(req.user.id);
        if (!userId) {
            res.status(400).json({ error: "User Id is required" });
            return;
        }
        const reviews = await db.review.findMany({
            where: {
                userId,
            },
            include: {
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
        if (reviews.length === 0) {
            res.status(200).json({ message: "No reviews found" });
            return;
        }
        res.status(200).json(reviews);
        return;
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
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
        .number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .optional(),
});
// Update a specific review
async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const ReviewId = parseInt(reviewId, 10);
        if (isNaN(ReviewId)) {
            res.status(400).json({ error: "Invalid or missing product ID." });
            return;
        }
        const review = await db.review.findUnique({
            where: { id: ReviewId },
        });
        if (!review) {
            res.status(404).json({ error: "Review not found." });
            return;
        }
        const validatedData = await reveiewUpdateSchema.parse(req.body);
        const updatedReviewData = Object.fromEntries(Object.entries(validatedData).filter(([_, value]) => value !== undefined));
        const updatedReview = await db.review.update({
            where: { id: ReviewId },
            data: updatedReviewData,
            include: {
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
        res.status(200).json({
            message: "Review updated successfully.",
            review: updatedReview,
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
// Get all products of a specific category
async function getRelatedProducts(req, res) {
    try {
        const { categoryName } = req.params;
        if (!categoryName) {
            res.status(400).json({ error: "Category name is required" });
            return;
        }
        const relatedProducts = await db.product.findMany({
            where: {
                categoryName,
            },
            include: {
                images: true,
                reviews: true,
            },
        });
        if (relatedProducts.length === 0) {
            res
                .status(200)
                .json({ message: "No products available fro this category" });
            return;
        }
        res.status(200).json({ products: relatedProducts });
        return;
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Get searched products
async function searchProducts(req, res) {
    try {
        const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
        if (!query) {
            res.json({ error: "Query is required to search the products" });
            return;
        }
        const products = await db.product.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            take: 4,
            include: {
                images: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        console.log("Search error : ", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function getDeal(req, res) {
    try {
        const product = await db.product.findFirst({
            orderBy: {
                offerPercentage: "desc",
            },
            include: {
                images: true,
            },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(200).json(product);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_DEAL+PRODUCT", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { getAllProducts, sendReview, deleteReview, updateReview, getSingleProduct, getUserReviews, getRelatedProducts, searchProducts, getDeal, };
