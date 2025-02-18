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

    const seller: Seller | null = await db.seller.findUnique({
      where: {
        id: SellerId,
      },
    });

    if (!seller) {
      res.status(404).json({ error: "No users available" });
      return;
    }

    res.status(200).json(seller);
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
