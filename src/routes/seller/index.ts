import { Router } from "express";
import authRoutes from "./auth.js";
import {
  deleteAccount,
  getSellerDetails,
  updateSellerDetails,
} from "../../controllers/seller/index.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
import { isLoggedIn, isSameEntity } from "../../middlewares/auth.js";
import { upload } from "../../lib/multer.js";

const router: Router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Order Routes
router.use("/orders", orderRoutes);

// Seller delete account route
router.delete("/:id", deleteAccount);

// Product Routes
router.use("/products", productRoutes);

// Get user details of a specific user
router.get("/:id", isLoggedIn, isSameEntity, getSellerDetails);

// Update user details
router.patch(
  "/:id",
  isLoggedIn,
  isSameEntity,
  upload.single("pfp"),
  updateSellerDetails
);

export default router;
