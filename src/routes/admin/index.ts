import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import sellerRoutes from "./seller.js";
import productRoutes from "./product.js";
import cmsRoutes from "./cms/index.js";

const router: Router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// User Routes
router.use("/users", userRoutes);

// Seller Routes
router.use("/sellers", sellerRoutes);

// Content Management System Routes
router.use("/cms", cmsRoutes);

// Product Routes
router.use("/products", productRoutes);

export default router;
