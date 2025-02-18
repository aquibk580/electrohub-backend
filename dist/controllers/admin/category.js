import { z } from "zod";
import { db } from "../../lib/db.js";
import { validateFile } from "../../lib/validateFile.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
const CategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});
const extractPublicId = (url) => {
    const parts = url.split("/");
    const publicIdwithExtension = parts[parts.length - 1];
    return publicIdwithExtension.split(".")[0];
};
// Create category
async function createCategory(req, res) {
    try {
        const categoryData = await CategorySchema.parse(req.body);
        const image = req.file;
        if (!image) {
            res.status(400).json({ error: "Category image is required" });
            return;
        }
        validateFile(image);
        const existingCategory = await db.category.findUnique({
            where: {
                name: categoryData.name,
            },
        });
        if (existingCategory) {
            res.status(400).json({ error: "Category already exists" });
            return;
        }
        const imageUrl = await uploadToCloudinary(image.buffer, process.env.CATEGORY_FOLDER);
        const category = await db.category.create({
            data: {
                name: categoryData.name,
                imageUrl,
            },
        });
        res.status(201).json({ message: "Category added successfully", category });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_CREATING_CATEGORY", error);
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
// Get all categories
async function getAllCategories(req, res) {
    try {
        const category = await db.category.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
        if (category.length === 0) {
            res.status(404).json({ error: "Categories not available" });
            return;
        }
        res.status(200).json(category);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_CATEGORIES", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Delete single category
async function deleteCategory(req, res) {
    const { categoryName } = req.params;
    if (!categoryName) {
        res.status(400).json({ error: "Invalid or missing category name" });
        return;
    }
    try {
        const category = await db.category.findUnique({
            where: {
                name: categoryName,
            },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        await db.category.delete({
            where: {
                name: categoryName,
            },
        });
        const categoryPublicId = extractPublicId(category.imageUrl);
        if (categoryPublicId) {
            await cloudinary.uploader.destroy(`${process.env.CATEGORY_FOLDER}/${categoryPublicId}`);
        }
        res.status(200).json({
            message: `Category ${category.name} deleted successfully`,
            category,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_DELETING_CATEGORY", error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Update category
async function updateCategory(req, res) {
    const { categoryName } = req.params;
    if (!categoryName) {
        res.status(400).json({ error: "Invalid or missing category id" });
        return;
    }
    try {
        const category = await db.category.findUnique({
            where: {
                name: categoryName,
            },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        let updatedData = {};
        if (req.file) {
            const categoryPublicId = extractPublicId(category.imageUrl);
            if (categoryPublicId) {
                await cloudinary.uploader.destroy(`${process.env.CATEGORY_FOLDER}/${categoryPublicId}`);
            }
            const image = req.file;
            const imageUrl = await uploadToCloudinary(image.buffer, process.env.CATEGORY_FOLDER);
            updatedData.imageUrl = imageUrl;
        }
        const updatedCategory = await db.category.update({
            where: {
                name: categoryName,
            },
            data: updatedData,
        });
        res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory,
        });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_UPDATING_CATEGORY", error);
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
export { createCategory, getAllCategories, deleteCategory, updateCategory };
