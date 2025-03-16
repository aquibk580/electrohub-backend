import { Router } from "express";
import { getSingleSeller, getTopSellers } from "../../controllers/user/seller.js";
const router = Router();
// Get top sellers 
router.get("/", getTopSellers);
// Get single seller data
router.get("/:sellerId", getSingleSeller);
export default router;
