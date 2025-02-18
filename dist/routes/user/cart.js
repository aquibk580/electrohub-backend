import { Router } from "express";
import { addToCart, removeCartItem, getAllCartItems, updateCartitem, } from "../../controllers/user/cart.js";
import { isLoggedIn } from "../../middlewares/auth.js";
const router = Router();
// Get all cart items
router.get("/", isLoggedIn, getAllCartItems);
// Adding item to the cart
router.post("/add/:productId", isLoggedIn, addToCart);
// Removing item from the cart
router.delete("/remove/:cartItemId", isLoggedIn, removeCartItem);
// Update cartItem quantity
router.put("/update/:cartItemId", isLoggedIn, updateCartitem);
export default router;
