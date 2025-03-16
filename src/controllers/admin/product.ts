import { Request, Response } from "express";
import { db } from "../../lib/db.js";

interface ProductDB {
  id: number;
  name: string;
  description: string;
  price: number;
  offerPercentage: number | null;
  stock: number;
  categoryName: string;
}

// Get All products for a specific seller
async function getAllProducts(req: Request, res: Response) {
  try {
    const products: Array<ProductDB> = await db.product.findMany({
      include: {
        images: true,
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

export { getAllProducts, getTopSellingProducts };
