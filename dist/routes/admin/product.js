import { Router } from "express";
import { getAllProducts, getTopSellingProducts, } from "../../controllers/admin/product.js";
const router = Router();
// Get all products
router.get("/", getAllProducts);
// Get top selling products
router.get("/topselling/:productCount", getTopSellingProducts);
export default router;
