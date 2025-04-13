import { Request, Response } from "express";
import { db } from "../../lib/db.js";

async function getTopSellers(req: Request, res: Response) {
  try {
    const topSellers = await db.seller.findMany({
      take: 8,
      orderBy: {
        products: {
          _count: "desc",
        },
      },
    });

    if (topSellers.length === 0) {
      res.status(200).json({ message: "No Sellers available" });
      return;
    }

    res.status(200).json({ sellers: topSellers });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_TOP_SELLERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

async function getSingleSeller(req: Request, res: Response) {
  try {
    const params = req.params;
    const sellerId = parseInt(params.sellerId, 10);
    if (isNaN(sellerId)) {
      res.status(400).json({ error: "Missing or invalid seller id" });
      return;
    }

    const seller = await db.seller.findUnique({
      where: {
        id: sellerId,
      },
      include: {
        products: {
          include: {
            images: {
              take: 1,
              orderBy: {
                id: "asc",
              },
            },
            reviews: true,
          },
        },
      },
    });

    if (!seller) {
      res
        .status(400)
        .json({ error: "Seller does not exist with the given id" });
      return;
    }

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

    res.status(200).json({ seller, averageRating, totalSales });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_TOP_SELLER_DATA", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export { getTopSellers, getSingleSeller };
