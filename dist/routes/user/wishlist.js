import { Router } from "express";
import { addProductToWishlist, getAllProductsFromWishlist, removeProductFromWishlist, } from "../../controllers/user/wishlist.js";
const router = Router();
// Add item to the wishlist
router.post("/add/:id", addProductToWishlist);
// Remove item from the wishlist
router.post("/remove/:id", removeProductFromWishlist);
// Get all products from wishlist
router.get("/", getAllProductsFromWishlist);
export default router;
