import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { UserPayload } from "../../types/Payload.js";

interface Wishlist {
  userId: number;
}

// Add product to wishlist
async function addProductToWishlist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      res.status(400).json({ error: "Missing or invalid product Id" });
      return;
    }

    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId, 10);

    let wishlist: Wishlist | null = await db.wishlist.findUnique({
      where: { userId: parsedUserId },
    });

    if (wishlist) {
      wishlist = await db.wishlist.update({
        where: { userId: parsedUserId },
        data: {
          products: {
            connect: { id: productId },
          },
        },
      });
    } else {
      wishlist = await db.wishlist.create({
        data: {
          userId: parsedUserId,
          products: {
            connect: { id: productId },
          },
        },
      });
    }

    res.status(200).json({ message: "Item added to wishlist", wishlist });
    return;
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Remove product from wishlist
async function removeProductFromWishlist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      res.status(400).json({ error: "Missing or invalid product Id" });
      return;
    }

    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId, 10);

    const wishlist: Wishlist = await db.wishlist.update({
      where: { userId: parsedUserId },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    });

    res.status(200).json({ message: "Item removed from wishlist", wishlist });
    return;
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get all products from the wishlist
async function getAllProductsFromWishlist(req: Request, res: Response) {
  try {
    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId, 10);

    const wishlist: Wishlist | null = await db.wishlist.findUnique({
      where: { userId: parsedUserId },
      include: {
        products: true,
      },
    });

    if (!wishlist) {
      res.status(404).json({ error: "Wishlist not found" });
      return;
    }

    res.status(200).json({ wishlist });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export {
  addProductToWishlist,
  removeProductFromWishlist,
  getAllProductsFromWishlist,
};
