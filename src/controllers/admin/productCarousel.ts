import { Request, Response } from "express";
import { z, ZodSchema } from "zod";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
import { db } from "../../lib/db.js";

const productCarouselSchema: ZodSchema = z.object({
  href: z.string().min(3, "Href must be at least 3 character long"),
  name: z.string().min(3, "Name must be at least 3 character long"),
  price: z.string().min(1, "Name must be at least 3 character long"),
});

interface ProductCarousel {
  id: number;
  href: string;
  name: string;
  price: number;
  imageUrl: string;
}

const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const publicIdwithExtension = parts[parts.length - 1];
  return publicIdwithExtension.split(".")[0];
};

// Create product carousel
async function createProductCarousel(req: Request, res: Response) {
  try {
    const validatedData: { href: string; name: string; price: string } =
      await productCarouselSchema.parse(req.body);

    const { price, ...restData } = validatedData;
    const parsedPrice = parseInt(price, 10);

    const image = req.file;
    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const imageUrl = await uploadToCloudinary(
      image.buffer,
      process.env.PRODUCT_CAROUSEL_FOLDER!
    );

    const productCarousel: ProductCarousel = await db.productCarousel.create({
      data: {
        imageUrl,
        price: parsedPrice,
        ...restData,
      },
    });

    res.status(201).json({
      message: "Product Carousel item created successfully",
      productCarousel,
    });
  } catch (error: any) {
    console.log("ERROR_WHILE_CREATING_PRODUCT_CAROUSEL");
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
  href: z.string().min(3, "Href must be at least 3 character long").optional(),
  name: z.string().min(3, "Name must be at least 3 character long").optional(),
  price: z.string().min(1, "Name must be at least 3 character long").optional(),
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

    const validatedData: { href?: string; name?: string; price?: string } =
      await updateProductCarouselSchema.parse(req.body);

    let updatedData: {
      href?: string;
      imageUrl?: string;
      name?: string;
      price?: number;
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
        process.env.BANNER_CAROUSEL_FOLDER!
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
    console.log("ERROR_WHILE_UPDATING_PRODUCT_CAROUSEL");
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
