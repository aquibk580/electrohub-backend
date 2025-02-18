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


export { getAllProducts }