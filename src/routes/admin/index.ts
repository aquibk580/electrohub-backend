import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import sellerRoutes from "./seller.js";
import productRoutes from "./product.js";
import cmsRoutes from "./cms/index.js";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import { getSalesStatistics } from "../../controllers/admin/index.js";

const router: Router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// User Routes
router.use("/users", isAdminLoggedIn, userRoutes);

// Seller Routes
router.use("/sellers", isAdminLoggedIn, sellerRoutes);

// Content Management System Routes
router.use("/cms", isAdminLoggedIn, cmsRoutes);

// Product Routes
router.use("/products", isAdminLoggedIn, productRoutes);

// Sales Route
router.get("/sales", isAdminLoggedIn, getSalesStatistics);

export default router;
