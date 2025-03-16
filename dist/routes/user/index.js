import { Router } from "express";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";
import wishlistRoutes from "./wishlist.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
import sellerRoutes from "./seller.js";
import { deleteAccount, getUserDetails, updateUserDetails, } from "../../controllers/user/index.js";
import { isLoggedIn, isSameEntity } from "../../middlewares/auth.js";
const router = Router();
// Auth routes
router.use("/auth", authRoutes);
// Products routes
router.use("/products", productRoutes);
// Seller Routes
router.use("/sellers", sellerRoutes);
// Cart routes
router.use("/cart", isLoggedIn, cartRoutes);
// Wishlist routes
router.use("/wishlist", isLoggedIn, wishlistRoutes);
// Order routes
router.use("/orders", isLoggedIn, orderRoutes);
// Get user details of a specific user
router.get("/:id", isLoggedIn, isSameEntity, getUserDetails);
// Delete user account
router.delete("/:id", isLoggedIn, isSameEntity, deleteAccount);
// Update user details
router.patch("/:id", isLoggedIn, isSameEntity, updateUserDetails);
export default router;
