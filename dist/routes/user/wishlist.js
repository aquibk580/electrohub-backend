import { Router } from "express";
import { getAllProductsFromWishlist, getWishlist, toggleWishlist, } from "../../controllers/user/wishlist.js";
import { isLoggedIn } from "../../middlewares/auth.js";
const router = Router();
// Toggle wishlist item
router.post("/:id", isLoggedIn, toggleWishlist);
// Get all products from wishlist
router.get("/", isLoggedIn, getAllProductsFromWishlist);
// Get ids of the wishlisted products
router.get("/wishlistproducts", isLoggedIn, getWishlist);
export default router;
