import { Request, Response } from "express";
import { z, ZodSchema } from "zod";
import { db } from "../../lib/db.js";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
import { validateFile } from "../../lib/validateFile.js";
import { ProductStatus } from "@prisma/client";
import { UserPayload } from "../../types/Payload.js";

const detailsSchema = z.array(
  z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
  })
);

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z.string().min(1, "Price is required and must be at least 1 rupee"),
  offerPercentage: z.string().optional().nullable(),
  stock: z.string().min(1, "Stock is required"),
  categoryName: z
    .string()
    .min(2, "Category name must be at least 2 characters long"),
  brand: z.string().min(2, "Brand name must be at least 2 characters long"),
  details: z
    .string()
    .optional()
    .transform((data) => {
      if (!data) return undefined;
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error("Invalid JSON format for details");
      }
    })
    .refine((data) => Array.isArray(data), {
      message: "Details must be an array",
    })
    .pipe(detailsSchema),
});

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
  url: string;
  productId: number;
}

const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const publicIdwithExtension = parts[parts.length - 1];
  return publicIdwithExtension.split(".")[0];
};

// Create product
async function createProduct(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const SellerId = parseInt(sellerId, 10);

    if (isNaN(SellerId)) {
      res.status(400).json({ error: "Seller ID must be a number" });
      return;
    }

    const productData = await productSchema.parse(req.body);

    const category = await db.category.findUnique({
      where: { name: productData.categoryName },
    });

    if (!category) {
      res.status(400).json({ error: "Category does not exist" });
      return;
    }

    const { brand, details, ...Product } = productData;

    const productInfo = await db.productInfo.create({
      data: {
        brand,
        details: details || {},
      },
    });

    const { price, offerPercentage, stock, ...restProductData } = Product;
    const parsedPrice = parseFloat(price);
    const parsedOfferPercentage = offerPercentage
      ? parseFloat(offerPercentage)
      : null;
    const parsedStock = parseInt(stock, 10);

    const product = await db.product.create({
      data: {
        productInfoId: productInfo.id,
        sellerId: SellerId,
        price: parsedPrice,
        offerPercentage: parsedOfferPercentage,
        stock: parsedStock,
        ...restProductData,
      },
    });

    if (!req.files || (req.files as Express.Multer.File[]).length < 3) {
      res.status(400).json({ error: "At least three images are required" });
      return;
    }

    const images = req.files as Express.Multer.File[];

    const imageDatas: Array<Image> = [];
    for (const image of images) {
      validateFile(image);

      const imageUrl = await uploadToCloudinary(
        image.buffer,
        process.env.PRODUCT_FOLDER!
      );

      imageDatas.push({
        url: imageUrl,
        productId: product.id,
      });
    }

    await db.productImage.createMany({
      data: imageDatas,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
      productInfo,
      images: imageDatas,
    });
  } catch (error: any) {
    console.error("ERROR_WHILE_CREATING_PRODUCT", error);

    if (error.name === "ZodError") {
      res.status(400).json({ errors: error.errors });
      return;
    }

    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
    return;
  }
}

// Get All products for a specific seller
async function getAllProducts(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const SellerId = parseInt(sellerId, 10);

    if (isNaN(SellerId)) {
      res.status(400).json({ error: "Invalid or missing seller id" });
      return;
    }

    const products: Array<ProductDB> = await db.product.findMany({
      where: { sellerId: SellerId },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        reviews: true,
        productInfo: true,
      },
    });

    if (products.length === 0) {
      res
        .status(404)
        .json({ error: "No products are available for this seller" });
      return;
    }

    res.status(200).json(products);
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_GETTING_PRODUCT", error);

    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

// Delete a specific product
async function deleteProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);

    if (isNaN(ProductId)) {
      res.status(400).json({ error: "Invalid or missing product ID" });
      return;
    }

    const product = await db.product.findUnique({
      where: { id: ProductId },
      include: {
        productInfo: true,
        images: true,
        reviews: true,
        cartItems: true,
        orderItems: true,
        wishlists: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (product.images.length > 1) {
      for (let i = 1; i < product.images.length; i++) {
        const image = product.images[i];
        const imagePublicId = extractPublicId(image.url);
        if (imagePublicId) {
          await cloudinary.uploader.destroy(
            `${process.env.PRODUCT_FOLDER}/${imagePublicId}`
          );
        }
      }
    }

    if (product.images.length > 1) {
      const imagesToDelete = product.images.slice(1);
      await db.productImage.deleteMany({
        where: {
          id: {
            in: imagesToDelete.map((img) => img.id),
          },
        },
      });
    }

    await db.product.update({
      where: { id: ProductId },
      data: {
        status: "Discontinued",
      },
    });

    await db.review.deleteMany({
      where: { productId: ProductId },
    });

    await db.cartItem.deleteMany({
      where: { productId: ProductId },
    });

    const wishlists = await db.wishlist.findMany({
      where: {
        products: {
          some: {
            id: ProductId,
          },
        },
      },
    });

    for (const wishlist of wishlists) {
      await db.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            disconnect: { id: ProductId },
          },
        },
      });
    }

    if (product.productInfo) {
      await db.productInfo.update({
        where: { id: product.productInfoId },
        data: {
          details: [],
        },
      });
    }

    res.status(200).json({
      message:
        "Product marked as inactive, images deleted, and related data preserved for history",
      product,
    });
  } catch (error: any) {
    console.error("ERROR_WHILE_DELETING_PRODUCT", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

// Delete a product permanently
async function deleteProductPermanently(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);

    if (isNaN(ProductId)) {
      res.status(400).json({ error: "Invalid or missing product ID" });
      return;
    }

    const product: ProductDB | null = await db.product.findUnique({
      where: {
        id: ProductId,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db.product.delete({
      where: {
        id: ProductId,
      },
    });

    res.status(200).json({ message: "Product deleted permanently", product });
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_DELETING_PRODUCT_PERMANENTLY", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

const productUpdateSchema: ZodSchema = z.object({
  name: z
    .string()
    .min(2, "Product name is required and must be at least 2 characters long")
    .optional(),
  description: z
    .string()
    .min(10, "Description is required and must be at least 10 characters long")
    .optional(),
  price: z
    .string()
    .min(1, "Price is required and must be at least 1 rupee")
    .optional(),
  offerPercentage: z
    .string()
    .min(0, "Offer percentage must be at least 0")
    .optional(),
  stock: z
    .string()
    .min(1, "Stock is required and must be at least 1")
    .optional(),
  categoryName: z
    .string()
    .min(2, "Category name is required and must be at least 2 characters long")
    .optional(),
  brand: z
    .string()
    .min(2, "Brand is required and must be at least 2 characters long")
    .optional(),
  details: z.any().optional(), // JSON field for dynamic product details
  status: z.nativeEnum(ProductStatus).optional(),
});

// Update a specific product
async function updateProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);

    if (isNaN(ProductId)) {
      res.status(400).json({ error: "Invalid or missing product ID." });
      return;
    }

    const product = await db.product.findUnique({
      where: { id: ProductId },
      include: { productInfo: true, images: true },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    const validatedData = await productUpdateSchema.parse(req.body);

    const { brand, details, categoryName, ...productData } = validatedData;

    if (productData.stock !== undefined)
      productData.stock = parseInt(productData.stock);
    if (productData.price !== undefined)
      productData.price = parseFloat(productData.price);
    if (productData.offerPercentage !== undefined) {
      productData.offerPercentage = parseInt(productData.offerPercentage);
    }

    const updatedProductData = Object.fromEntries(
      Object.entries(productData).filter(([_, value]) => value !== undefined)
    );

    if (updatedProductData.stock === 0) {
      await db.product.update({
        where: { id: ProductId },
        data: { status: "OutOfStock" },
      });
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    const newImageUrls = await Promise.all(
      uploadedFiles.map(async (file) => {
        validateFile(file);
        return await uploadToCloudinary(
          file.buffer,
          process.env.PRODUCT_FOLDER!
        );
      })
    );

    const totalImages = product.images.length + newImageUrls.length;
    if (totalImages < 3) {
      res.status(400).json({ error: "At least 3 images are required." });
      return;
    }
    if (totalImages > 5) {
      res.status(400).json({ error: "A maximum of 5 images is allowed." });
      return;
    }

    await Promise.all(
      newImageUrls.map(async (url) => {
        await db.productImage.create({
          data: {
            url,
            productId: ProductId,
          },
        });
      })
    );

    let updatedProduct;
    if (categoryName) {
      updatedProduct = await db.product.update({
        where: { id: ProductId },
        data: {
          ...updatedProductData,
          category: { connect: { name: categoryName } },
          productInfo: {
            update: {
              brand: brand || product.productInfo.brand,
              details: JSON.parse(details) || product.productInfo.details,
            },
          },
        },
        include: { productInfo: true, images: true },
      });
    } else if (productData.status !== "OutOfStock") {
    } else {
      updatedProduct = await db.product.update({
        where: { id: ProductId },
        data: {
          ...updatedProductData,
          productInfo: {
            update: {
              brand: brand || product.productInfo.brand,
              details: JSON.parse(details) || product.productInfo.details,
            },
          },
        },
        include: { productInfo: true, images: true },
      });
    }

    res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_UPDATING_PRODUCT", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

// Delete single image of a product
async function deleteProductImage(req: Request, res: Response) {
  try {
    const { imageId } = req.params;
    const image = await db.productImage.findUnique({
      where: { id: parseInt(imageId, 10) },
    });

    if (!image) {
      res.status(404).json({ error: "Image not found." });
      return;
    }

    const productImages = await db.productImage.findMany({
      where: { productId: image.productId },
    });

    if (productImages.length <= 3) {
      res.status(400).json({
        error: "A product must have at least 3 images.",
        status: "ImageQuantityError",
      });
      return;
    }

    const imagePublicId = extractPublicId(image.url);
    await cloudinary.uploader.destroy(
      `${process.env.PRODUCT_FOLDER}/${imagePublicId}`
    );

    await db.productImage.delete({ where: { id: image.id } });

    res.status(200).json({ message: "Product image deleted successfully." });
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_DELETING_IMAGE", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
    return;
  }
}

// Get single product of a single seller
async function getSingleProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);
    const sellerId = parseInt((req.user as UserPayload).id);

    if (isNaN(ProductId)) {
      res.status(400).json({ error: "Missing or Invalid product id" });
      return;
    }

    const product: ProductDB | null = await db.product.findUnique({
      where: {
        id: ProductId,
        sellerId,
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

export {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  deleteProductImage,
  getSingleProduct,
  deleteProductPermanently,
};
