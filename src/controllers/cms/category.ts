import { Request, Response } from "express";
import { db } from "../../lib/db.js";

interface Category {
  name: string;
  imageUrl: string;
}

// Get all categories
export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories: Array<Category> = await db.category.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (categories.length === 0) {
      res.status(404).json({ error: "Categories not available" });
      return;
    }

    res.status(200).json(categories);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_CATEGORIES", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
