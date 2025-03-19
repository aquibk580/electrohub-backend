import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import {
  getAllProducts,
  getProductStats,
  getSingleProduct,
  getTopSellingProducts,
} from "../../controllers/admin/product.js";

const router: Router = Router();

// Get all products
router.get("/", getAllProducts);

// Get Product Stats
router.get("/productStats", getProductStats);

// Get top selling products
router.get("/topselling/:productCount", getTopSellingProducts);

// Get single product
router.get("/:productId", getSingleProduct);

export default router;
