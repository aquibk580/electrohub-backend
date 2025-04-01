import { Request, Response } from "express";
import { z, ZodSchema } from "zod";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
import { db } from "../../lib/db.js";
import sharp from "sharp";

const productCarouselSchema: ZodSchema = z.object({
  href: z.string().min(1, "Href must be at least 1 character long"),
  name: z.string().min(1, "Name must be at least 1 character long"),
  price: z.string().min(1, "Price must be at least 1 character long"),
  isActive: z.union([z.string(), z.boolean()]).default(true),
});

async function optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer).resize({ width: 500 }).toFormat("png").toBuffer();
}

interface ProductCarousel {
  id: number;
  href: string;
  name: string;
  price: number;
  imageUrl: string;
}

const extractPublicId = (url: string): string => {
  return url.split("/").pop()?.split(".")[0] || "";
};

// Create product carousel
async function createProductCarousel(req: Request, res: Response) {
  try {
    const validatedData = await productCarouselSchema.parse(req.body);

    const { price, isActive, ...restData } = validatedData;
    const parsedPrice = parseInt(price, 10);
    const parsedIsActive =
      validatedData.isActive === "true" || validatedData.isActive;

    const image = req.file;
    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const optimizedImage = await optimizeImage(image.buffer);

    const imageUrl = await uploadToCloudinary(
      optimizedImage,
      process.env.PRODUCT_CAROUSEL_FOLDER!
    );

    const productCarousel: ProductCarousel = await db.productCarousel.create({
      data: {
        imageUrl,
        price: parsedPrice,
        isActive: parsedIsActive,
        ...restData,
      },
    });

    res.status(201).json({
      message: "Product Carousel item created successfully",
      productCarousel,
    });
  } catch (error: any) {
    console.error("ERROR_WHILE_CREATING_PRODUCT_CAROUSEL", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get all product carousels
async function getAllProductCarousels(req: Request, res: Response) {
  try {
    const productCarousel = await db.productCarousel.findMany({});

    if (productCarousel.length === 0) {
      res.status(404).json({ error: "No Product Carousel Item Available" });
      return;
    }

    res.status(200).json(productCarousel);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_PRODUCT_CAROUSELS");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

const updateProductCarouselSchema: ZodSchema = z.object({
  href: z.string().min(1, "Href must be at least 1 character long").optional(),
  name: z.string().min(1, "Name must be at least 3 character long").optional(),
  price: z.string().min(1, "Name must be at least 3 character long").optional(),
  isActive: z.string().optional(),
});

// Update a specific product carousel
async function updateProductCarousel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const productCarouselId = parseInt(id, 10);

    if (isNaN(productCarouselId)) {
      res.status(400).json({ error: "Invalid or missing product carousel id" });
      return;
    }

    const productCarousel: ProductCarousel | null =
      await db.productCarousel.findUnique({
        where: {
          id: productCarouselId,
        },
      });

    if (!productCarousel) {
      res.status(404).json({ error: "Product Carousel not found" });
      return;
    }

    const validatedData = await updateProductCarouselSchema.parse(req.body);

    let updatedData: {
      href?: string;
      imageUrl?: string;
      name?: string;
      price?: number;
      isActive?: boolean;
    } = {};
    if (validatedData.href) {
      updatedData.href = validatedData.href;
    }

    if (validatedData.name) {
      updatedData.name = validatedData.name;
    }

    if (validatedData.price) {
      updatedData.price = parseFloat(validatedData.price);
    }

    if (validatedData.isActive !== undefined) {
      updatedData.isActive =
        typeof validatedData.isActive === "string"
          ? validatedData.isActive === "true"
          : validatedData.isActive;
    }

    const image = req.file;
    if (image) {
      const existingImage = productCarousel.imageUrl;
      if (existingImage) {
        const imagePublicId = extractPublicId(existingImage);
        if (imagePublicId) {
          await cloudinary.uploader.destroy(
            `${process.env.PRODUCT_CAROUSEL_FOLDER!}/${imagePublicId}`
          );
        }
      }
      const imageUrl = await uploadToCloudinary(
        image.buffer,
        process.env.PRODUCT_CAROUSEL_FOLDER!
      );

      updatedData.imageUrl = imageUrl;
    }

    const updatedProductCarousel = await db.productCarousel.update({
      where: {
        id: productCarouselId,
      },
      data: updatedData,
    });

    res.status(200).json({
      message: "Product Carosuel Updated Successfully",
      productCarousel: updatedProductCarousel,
    });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_UPDATING_PRODUCT_CAROUSEL", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Delete a specific product carousel
async function deleteProductCarousel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const productCarouselId = parseInt(id, 10);

    if (isNaN(productCarouselId)) {
      res.status(400).json({ error: "Invalid or missing product carousel id" });
      return;
    }

    const productCarousel: ProductCarousel | null =
      await db.productCarousel.findUnique({
        where: {
          id: productCarouselId,
        },
      });

    if (!productCarousel) {
      res.status(404).json({ error: "Product Carousel not found" });
      return;
    }

    if (productCarousel.imageUrl) {
      const imagePublicId = extractPublicId(productCarousel.imageUrl);
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }
    }

    await db.productCarousel.delete({
      where: {
        id: productCarouselId,
      },
    });

    res.status(200).json({
      message: "Product Carousel Deleted Successfully",
      productCarousel,
    });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_DELETING_PRODUCT_CAROUSEL");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export {
  createProductCarousel,
  getAllProductCarousels,
  deleteProductCarousel,
  updateProductCarousel,
};
