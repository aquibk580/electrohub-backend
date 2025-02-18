import { z } from "zod";
import { db } from "../../lib/db.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
const bannerCarouselSchema = z.object({
    href: z.string().min(3, "Href must be at least 3 character long"),
});
const extractPublicId = (url) => {
    const parts = url.split("/");
    const publicIdwithExtension = parts[parts.length - 1];
    return publicIdwithExtension.split(".")[0];
};
// Create banner carousel
async function createBannerCarousel(req, res) {
    try {
        const validatedData = await bannerCarouselSchema.parse(req.body);
        const image = req.file;
        if (!image) {
            res.status(400).json({ error: "Image is required" });
            return;
        }
        const imageUrl = await uploadToCloudinary(image.buffer, process.env.BANNER_CAROUSEL_FOLDER);
        const bannerCarousel = await db.bannerCarousel.create({
            data: {
                href: validatedData.href,
                imageUrl,
            },
        });
        res
            .status(201)
            .json({ message: "Banner created successfully", bannerCarousel });
    }
    catch (error) {
        console.log("ERROR_WHILE_CREATING_BANNER_CAROUSEL");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Get all banner carousels
async function getAllBannerCarousels(req, res) {
    try {
        const bannerCarousels = await db.bannerCarousel.findMany({});
        if (bannerCarousels.length === 0) {
            res.status(404).json({ error: "No Banner Carousel Available" });
            return;
        }
        res.status(200).json(bannerCarousels);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_BANNER_CAROUSELS");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
const updateBannerCarouselSchema = z.object({
    href: z.string().min(3, "Href must be at least 3 character long").optional(),
});
// Update a specific banner carousel
async function updateBannerCarousel(req, res) {
    try {
        const { id } = req.params;
        const bannerCarouselId = parseInt(id, 10);
        if (isNaN(bannerCarouselId)) {
            res.status(400).json({ error: "Invalid or missing banner carousel id" });
            return;
        }
        const bannerCarousel = await db.bannerCarousel.findUnique({
            where: {
                id: bannerCarouselId,
            },
        });
        if (!bannerCarousel) {
            res.status(404).json({ error: "Banner Carousel not found" });
            return;
        }
        const validatedData = await updateBannerCarouselSchema.parse(req.body);
        let updatedData = {};
        if (validatedData.href) {
            updatedData.href = validatedData.href;
        }
        const image = req.file;
        if (image) {
            const exisitingImage = bannerCarousel.imageUrl;
            if (exisitingImage) {
                const imagePublicId = extractPublicId(exisitingImage);
                if (imagePublicId) {
                    await cloudinary.uploader.destroy(`${process.env.BANNER_CAROUSEL_FOLDER}/${imagePublicId}`);
                }
            }
            const imageUrl = await uploadToCloudinary(image.buffer, process.env.BANNER_CAROUSEL_FOLDER);
            updatedData.imageUrl = imageUrl;
        }
        const updatedBannerCarousel = await db.bannerCarousel.update({
            where: {
                id: bannerCarouselId,
            },
            data: updatedData,
        });
        res.status(200).json({
            message: "Banner Carosuel Updated Successfully",
            bannerCarousel: updatedBannerCarousel,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_UPDATING_BANNER_CAROUSEL");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Delete a specific banner carousel
async function deleteBannerCarousel(req, res) {
    try {
        const { id } = req.params;
        const bannerCarouselId = parseInt(id, 10);
        if (isNaN(bannerCarouselId)) {
            res.status(400).json({ error: "Invalid or missing banner carousel id" });
            return;
        }
        const bannerCarousel = await db.bannerCarousel.findUnique({
            where: {
                id: bannerCarouselId,
            },
        });
        if (!bannerCarousel) {
            res.status(404).json({ error: "Banner Carousel not found" });
            return;
        }
        await db.bannerCarousel.delete({
            where: {
                id: bannerCarouselId,
            },
        });
        res.status(200).json({
            message: "Banner Carousel Deleted Successfully",
            bannerCarousel,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_DELETING_BANNER_CAROUSEL");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { createBannerCarousel, deleteBannerCarousel, getAllBannerCarousels, updateBannerCarousel, };
