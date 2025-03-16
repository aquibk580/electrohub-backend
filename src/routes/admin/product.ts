import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import {
  getAllProducts,
  getTopSellingProducts,
} from "../../controllers/admin/product.js";

const router: Router = Router();

// Get all products
router.get("/", getAllProducts);

// Get top selling products
router.get("/topselling/:productCount", getTopSellingProducts);

export default router;
