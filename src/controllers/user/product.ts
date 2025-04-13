import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { z, ZodSchema } from "zod";
import { UserPayload } from "../../types/Payload.js";
import { validateFile } from "../../lib/validateFile.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";

interface ProductDB {
  id: number;
  name: string;
  description: string;
  price: number;
  offerPercentage: number | null;
  stock: number;
  categoryName: string;
}

interface Image {
  id: number;
  url: string;
  productId: number;
}

// Get all products
async function getAllProducts(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string | undefined;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: {
        in: ["OutOfStock", "Active"],
      },
    };

    if (category && category !== "All") {
      whereClause.categoryName = category;
    }

    const products = await db.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: true,
        images: {
          take: 1,
          orderBy: {
            id: "asc",
          },
        },
      },
      skip,
      take: limit,
    });

    res.status(200).json({ products });
  } catch (error: any) {
    console.error("ERROR_WHILE_GETTING_PRODUCT", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

// Get single product of a single seller
async function getSingleProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);

    if (isNaN(ProductId)) {
      res.status(400).json({ error: "Missing or Invalid product id" });
      return;
    }

    const product: ProductDB | null = await db.product.findUnique({
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
  } catch (error: any) {
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

interface Review {
  content: string;
  rating: number;
}

// review a product
async function sendReview(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId, 10);

    if (isNaN(parsedProductId)) {
      res.status(400).json({ error: "Invalid or missing product Id" });
      return;
    }

    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId, 10);

    const reviewData: Review = await reviewSchema.parse(req.body);

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
  } catch (error: any) {
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
async function getUserReviews(req: Request, res: Response) {
  try {
    const userId = parseInt((req.user as UserPayload).id);

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
          select: {
            id: true,
            name: true,
            images: {
              take: 1,
              orderBy: {
                id: "asc",
              },
            },
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
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Delete a specific review
async function deleteReview(req: Request, res: Response) {
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
  } catch (error: any) {
    console.error("ERROR_WHILE_DELETING_REVIEW", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

interface ReviewUpdateType {
  content?: string | null;
  rating?: string | null;
}

const reveiewUpdateSchema: ZodSchema = z.object({
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
async function updateReview(req: Request, res: Response) {
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

    const validatedData: ReviewUpdateType = await reveiewUpdateSchema.parse(
      req.body
    );

    const updatedReviewData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

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
  } catch (error: any) {
    console.error("ERROR_WHILE_UPDATING_REVIEW", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

// Get all products of a specific category
async function getRelatedProducts(req: Request, res: Response) {
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
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get searched products
async function searchProducts(req: Request, res: Response) {
  try {
    const query =
      typeof req.query.query === "string" ? req.query.query.trim() : "";

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
  } catch (error: any) {
    console.log("Search error : ", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export {
  getAllProducts,
  sendReview,
  deleteReview,
  updateReview,
  getSingleProduct,
  getUserReviews,
  getRelatedProducts,
  searchProducts,
};
