import { Request, Response } from "express";
import { z, ZodSchema } from "zod";
import { db } from "../../lib/db.js";
import { validateFile } from "../../lib/validateFile.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";

const CategorySchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

interface Category {
  name: string;
}

const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const publicIdwithExtension = parts[parts.length - 1];
  return publicIdwithExtension.split(".")[0];
};

// Create category
async function createCategory(req: Request, res: Response) {
  try {
    const categoryData: Category = await CategorySchema.parse(req.body);

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

    const imageUrl = await uploadToCloudinary(
      image.buffer,
      process.env.CATEGORY_FOLDER!
    );

    const category: Category & { imageUrl: string } = await db.category.create({
      data: {
        name: categoryData.name,
        imageUrl,
      },
    });

    res.status(201).json({ message: "Category added successfully", category });
    return;
  } catch (error: any) {
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
async function getAllCategories(req: Request, res: Response) {
  try {
    const category: Array<Category> = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (category.length === 0) {
      res.status(404).json({ error: "Categories not available" });
      return;
    }

    res.status(200).json(category);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_CATEGORIES", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get all categories with count
async function getAllCategoriesWithCount(req: Request, res: Response) {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categories.length === 0) {
      res.status(404).json({ error: "Categories not available" });
      return;
    }

    const formattedCategories = categories.map((category) => ({
      name: category.name,
      productCount: category._count.products,
      createdAt: category.createdAt,
    }));

    res.status(200).json(formattedCategories);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_CATEGORIES", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Delete single category
async function deleteCategory(req: Request, res: Response) {
  const { categoryName } = req.params;

  if (!categoryName) {
    res.status(400).json({ error: "Invalid or missing category name" });
    return;
  }

  try {
    const category: (Category & { imageUrl: string }) | null =
      await db.category.findUnique({
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
      await cloudinary.uploader.destroy(
        `${process.env.CATEGORY_FOLDER}/${categoryPublicId}`
      );
    }

    res.status(200).json({
      message: `Category ${category.name} deleted successfully`,
      category,
    });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_DELETING_CATEGORY", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Update category
async function updateCategory(req: Request, res: Response) {
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
    let updatedData: { imageUrl?: string } = {};
    if (req.file) {
      const categoryPublicId = extractPublicId(category.imageUrl);

      if (categoryPublicId) {
        await cloudinary.uploader.destroy(
          `${process.env.CATEGORY_FOLDER}/${categoryPublicId}`
        );
      }
      const image = req.file;
      const imageUrl = await uploadToCloudinary(
        image.buffer,
        process.env.CATEGORY_FOLDER!
      );

      updatedData.imageUrl = imageUrl;
    }

    const updatedCategory: Category = await db.category.update({
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
  } catch (error: any) {
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

export {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getAllCategoriesWithCount,
};
