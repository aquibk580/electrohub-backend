import { Router } from "express";
import { getAllProducts, getProductStats, getSingleProduct, getTopSellingProducts, updateProductStatus, } from "../../controllers/admin/product.js";
const router = Router();
// Get all products
router.get("/", getAllProducts);
// Get Product Stats
router.get("/productStats", getProductStats);
// Get top selling products
router.get("/topselling/:productCount", getTopSellingProducts);
// Update product status
router.patch("/updateStatus/:productId", updateProductStatus);
// Get single product
router.get("/:productId", getSingleProduct);
export default router;
