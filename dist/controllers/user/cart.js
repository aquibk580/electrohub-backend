import { db } from "../../lib/db.js";
import { z } from "zod";
const cartItemSchema = z.object({
    quantity: z.string(),
});
// Get all items from the cart
async function getAllCartItems(req, res) {
    try {
        const userId = req.user.id;
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) {
            res.status(400).json({ error: "Invalid or missing userId" });
            return;
        }
        const cart = await db.cart.findUnique({
            where: {
                userId: parsedUserId,
            },
        });
        if (!cart) {
            res.status(404).json({ error: "Cart not foud for the given user Id" });
            return;
        }
        const cartItems = await db.cartItem.findMany({
            where: {
                cartId: cart.id,
            },
        });
        res.status(200).json(cartItems);
        return;
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Add item to the cart
async function addToCart(req, res) {
    try {
        const { productId } = req.params;
        const ProductId = parseInt(productId, 10);
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
            res.status(400).json({ error: "Missing or Invalid user Id" });
            return;
        }
        const { quantity } = await cartItemSchema.parse(req.body);
        const parsedQuantity = parseInt(quantity, 10);
        let cart;
        const existingCart = await db.cart.findUnique({
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
        }
        else {
            cart = existingCart;
        }
        const cartItem = await db.cartItem.create({
            data: {
                cartId: cart.id,
                productId: ProductId,
                quantity: parsedQuantity,
            },
        });
        res
            .status(200)
            .json({ message: "Item Added to the cart successfully", cart, cartItem });
        return;
    }
    catch (err) {
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
async function removeCartItem(req, res) {
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
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { addToCart, removeCartItem, getAllCartItems };
