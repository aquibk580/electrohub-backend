import { Router } from "express";
import authRoutes from "./auth.js";
import cartRoutes from "./cart.js";
import wishlistRoutes from "./wishlist.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
import {
  deleteAccount,
  getUserDetails,
  updateuserDetails,
} from "../../controllers/user/index.js";
import { isLoggedIn, isSameEntity } from "../../middlewares/auth.js";

const router: Router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Products routes
router.use("/products", productRoutes);

// Cart routes
router.use("/cart", isLoggedIn, cartRoutes);

// Wishlist routes
router.use("/wishlist", isLoggedIn, wishlistRoutes);

// Order routes
router.use("/order", isLoggedIn, orderRoutes);

// Get user details of a specific user
router.get("/:id", isLoggedIn, isSameEntity, getUserDetails);

// Delete user account
router.delete("/:id", isLoggedIn, isSameEntity, deleteAccount);

// Update user details
router.patch("/:id", isLoggedIn, isSameEntity, updateuserDetails);

export default router;
