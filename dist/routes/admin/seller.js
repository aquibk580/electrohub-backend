import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import { getAllSellers, getSingleSeller, getTopSellers, } from "../../controllers/admin/seller.js";
const router = Router();
// Get all sellers
router.get("/", isAdminLoggedIn, getAllSellers);
// Get top sellers
router.get("/topsellers", isAdminLoggedIn, getTopSellers);
// Get Single Seller
router.get("/:sellerId", isAdminLoggedIn, getSingleSeller);
export default router;
