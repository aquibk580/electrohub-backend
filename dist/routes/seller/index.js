import { Router } from "express";
import authRoutes from "./auth.js";
import { deleteAccount, getProfileStatistics, getSellerDetails, getSellerSalesStatistics, updateSellerDetails, } from "../../controllers/seller/index.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
import { isLoggedIn, isSameEntity, isSeller } from "../../middlewares/auth.js";
import { upload } from "../../lib/multer.js";
const router = Router();
// Auth routes
router.use("/auth", authRoutes);
// Order Routes
router.use("/orders", isLoggedIn, isSeller, orderRoutes);
// Product Routes
router.use("/products", isLoggedIn, isSeller, productRoutes);
// Get sales statistcis
router.get("/salesstatistics", isLoggedIn, isSeller, getSellerSalesStatistics);
// Get profile data
router.get("/profilestatistics", isLoggedIn, isSeller, getProfileStatistics);
// Seller delete account route
router.delete("/:id", isLoggedIn, isSeller, isSameEntity, deleteAccount);
// Get seller details of a specific seller
router.get("/:id", isLoggedIn, isSeller, isSameEntity, getSellerDetails);
// Update user details
router.patch("/:id", isLoggedIn, isSameEntity, upload.single("pfp"), updateSellerDetails);
export default router;
