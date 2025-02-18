import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import { getAllSellers, getSingleSeller } from "../../controllers/admin/seller.js";

const router: Router = Router();

// Get all sellers
router.get("/", isAdminLoggedIn, getAllSellers);

// Get Single Seller
router.get("/:sellerId", isAdminLoggedIn, getSingleSeller);

export default router;
