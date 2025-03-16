import { Request, Response } from "express";
import { db } from "../../lib/db.js";

interface Seller {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  answer?: string | null;
  phone?: string | null;
  address?: string | null;
  pfp?: string | null;
  provider?: string | null;
}

async function getAllSellers(req: Request, res: Response) {
  try {
    const sellers: Array<Seller> = await db.seller.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (sellers.length === 0) {
      res.status(404).json({ error: "No users available" });
      return;
    }

    res.status(200).json(sellers);
    return;

    // You can retrive the sellers at the frontend directly as "response.data" no need to do "response.data.sellers"
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_SELLERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

async function getSingleSeller(req: Request, res: Response) {
  try {
    const { sellerId } = req.params;
    const SellerId = parseInt(sellerId, 10);

    if (isNaN(SellerId)) {
      res.status(400).json({ error: "Seller Id is required" });
      return;
    }

    const seller = await db.seller.findUnique({
      where: {
        id: SellerId,
      },
      include: {
        products: {
          include: {
            reviews: true,
            images: true,
          },
        },
      },
    });

    if (!seller) {
      res.status(404).json({ error: "No users available" });
      return;
    }

    const sellerProducts = await db.product.findMany({
      where: {
        sellerId: SellerId,
      },
      include: {
        images: true,
        reviews: true,
      },
    });

    const productIds = sellerProducts.map((product) => product.id);

    const totalReturns = await db.orderItem.count({
      where: {
        productId: {
          in: productIds,
        },
        status: "Returned",
      },
    });

    const allReviews = seller.products.flatMap((product) => product.reviews);

    const totalRating = allReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );

    const averageRating =
      allReviews.length > 0 ? totalRating / allReviews.length : 0;

    const totalSales = await db.orderItem.count({
      where: {
        productId: {
          in:
            seller.products.length > 0
              ? seller.products.map((product) => product.id)
              : [0],
        },
      },
    });

    const orders = await db.orderItem.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    res.status(200).json({
      seller,
      averageRating,
      totalSales,
      totalReturns,
      sellerProducts,
      orders,
    });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_SELLERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
export { getAllSellers, getSingleSeller };
