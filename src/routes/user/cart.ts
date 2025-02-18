import { Router } from "express";
import {
  addToCart,
  removeCartItem,
  getAllCartItems,
} from "../../controllers/user/cart.js";

const router: Router = Router();

// Get all cart items
router.get("/", getAllCartItems);

// Adding item to the cart
router.post("/add/:productId", addToCart);

// Removing item from the cart
router.delete("/remove/:cartItemId", removeCartItem);

export default router;
