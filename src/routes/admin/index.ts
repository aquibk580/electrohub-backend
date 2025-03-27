import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import sellerRoutes from "./seller.js";
import productRoutes from "./product.js";
import cmsRoutes from "./cms/index.js";
import contactRoutes from "./contact.js";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import {
  getAllAdmins,
  getOrdersData,
  getSalesStatistics,
  getSingleOrder,
} from "../../controllers/admin/index.js";

const router: Router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// User Routes
router.use("/users", isAdminLoggedIn, userRoutes);

// Seller Routes
router.use("/sellers", isAdminLoggedIn, sellerRoutes);

// Get all admins
router.get("/admins", isAdminLoggedIn, getAllAdmins);

// contact routes
router.use("/messages", isAdminLoggedIn, contactRoutes);

// Content Management System Routes
router.use("/cms", isAdminLoggedIn, cmsRoutes);

// Product Routes
router.use("/products", isAdminLoggedIn, productRoutes);

// Sales Route
router.get("/sales", isAdminLoggedIn, getSalesStatistics);

// OrderItems and Order Stats
router.get("/orders", isAdminLoggedIn, getOrdersData);

// Get single order
router.get("/orders/:id", isAdminLoggedIn, getSingleOrder);

export default router;
