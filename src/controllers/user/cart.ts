import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { ZodSchema, z } from "zod";
import { UserPayload } from "../../types/Payload.js";

interface Cart {
  id: number;
  userId: number;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
}

const cartItemSchema = z.object({
  quantity: z.string(),
});

// Get all items from the cart
async function getAllCartItems(req: Request, res: Response) {
  try {
    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedUserId)) {
      res.status(400).json({ error: "Invalid or missing userId" });
      return;
    }

    const cart: Cart | null = await db.cart.findUnique({
      where: {
        userId: parsedUserId,
      },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not foud for the given user Id" });
      return;
    }

    const cartItems: Array<CartItem> = await db.cartItem.findMany({
      where: {
        cartId: cart.id,
      },
    });

    const productIds = cartItems.map((cartItem) => cartItem.productId);

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true, productInfo: true, reviews: true },
    });

    const productsWithCartItemId = products.map((product) => {
      const cartItem = cartItems.find((item) => item.productId === product.id);
      return {
        ...product,
        cartItemId: cartItem?.id,
        quantity: cartItem?.quantity || 1,
      };
    });

    res.status(200).json({ products: productsWithCartItemId });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Add item to the cart
async function addToCart(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const ProductId = parseInt(productId, 10);

    const userId = (req.user as UserPayload).id;
    const parsedUserId = parseInt(userId, 10);

    if (isNaN(parsedUserId)) {
      res.status(400).json({ error: "Missing or Invalid user Id" });
      return;
    }

    const { quantity } = await cartItemSchema.parse(req.body);
    const parsedQuantity = parseInt(quantity, 10);

    let cart: Cart;
    const existingCart: Cart | null = await db.cart.findUnique({
      where: {
        userId: parsedUserId,
      },
    });

    if (!existingCart) {
      cart = await db.cart.create({
        data: {
          userId: parsedUserId,
        },
      });
    } else {
      cart = existingCart;
    }

    const existingCartItem: CartItem | null = await db.cartItem.findUnique({
      where: {
        productId: ProductId,
      },
    });

    let cartItem: CartItem;
    if (existingCartItem) {
      cartItem = await db.cartItem.update({
        where: {
          productId: ProductId,
        },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
      });

      res.status(200).json({
        message: "Product quantity increased successfully",
        cart,
        cartItem,
      });
      return;
    } else {
      cartItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: ProductId,
          quantity: parsedQuantity,
        },
      });

      res.status(200).json({
        message: "Product Added to the cart successfully",
        cart,
        cartItem,
      });
      return;
    }
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

// Remove item from the cart
async function removeCartItem(req: Request, res: Response) {
  try {
    const { cartItemId } = req.params;
    const CartItemId = parseInt(cartItemId, 10);

    if (isNaN(CartItemId)) {
      res.status(400).json({ error: "Invalid CartItemId" });
      return;
    }

    const cartItem = await db.cartItem.delete({
      where: { id: CartItemId },
    });

    res
      .status(200)
      .json({ message: "Cart item removed successfully", cartItem });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
// update cartitem quantity
async function updateCartitem(req: Request, res: Response) {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const parsedCartItemId = parseInt(cartItemId, 10);
    const parsedQuantity = parseInt(quantity, 10);

    if (
      isNaN(parsedCartItemId) ||
      isNaN(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      res.status(400).json({ error: "Invalid CartItemId or quantity" });
      return;
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id: parsedCartItemId },
    });

    if (!cartItem) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    const updatedCartItem = await db.cartItem.update({
      where: { id: parsedCartItemId },
      data: { quantity: parsedQuantity },
    });

    res
      .status(200)
      .json({
        message: "Quantity updated successfully",
        cartItem: updatedCartItem,
      });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export { addToCart, removeCartItem, getAllCartItems, updateCartitem };
