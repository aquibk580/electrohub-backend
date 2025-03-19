import { Request, Response } from "express";
import { db } from "../../lib/db.js";

// Get All products for a specific seller
async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await db.product.findMany({
      include: {
        images: true,
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

// Get top selling products
async function getTopSellingProducts(req: Request, res: Response) {
  try {
    const params = req.params;
    const productCount = parseInt(params.productCount, 10);

    const topSellingProducts = await db.product.findMany({
      take: productCount,
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (topSellingProducts.length === 0) {
      res.status(200).json({ message: "No top selling products available" });
      return;
    }

    res.status(200).json({ products: topSellingProducts });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_TOP_SELLING_PRODUCTS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get Product Stats
async function getProductStats(req: Request, res: Response) {
  try {
    const totalProducts = await db.product.count({});
    const inStock = await db.product.count({
      where: {
        status: "Active",
      },
    });
    const outOfStock = await db.product.count({
      where: {
        status: "OutOfStock",
      },
    });
    const discontinued = await db.product.count({
      where: {
        status: "Discontinued",
      },
    });
    const categories = await db.category.count({});

    res
      .status(200)
      .json({ totalProducts, inStock, outOfStock, discontinued, categories });
    return;
  } catch (error) {
    console.log(error);
  }
}

// Get single product
async function getSingleProduct(req: Request, res: Response) {
  try {
    const params = req.params;
    const productId = parseInt(params.productId, 10);

    if (isNaN(productId)) {
      res.status(200).json({ error: "Missing or invalid product id" });
      return;
    }

    const product = await db.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        productInfo: true,
        reviews: true,
      },
    });

    if (!product) {
      res.status(404).json({ where: "Product not found" });
      return;
    }

    res.status(200).json(product);
    return;
  } catch (error) {
    console.log(error);
  }
}

export {
  getAllProducts,
  getTopSellingProducts,
  getProductStats,
  getSingleProduct,
};
