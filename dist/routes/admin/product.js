import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import { getAllProducts } from "../../controllers/admin/product.js";
const router = Router();
// Get all products
router.get("/", isAdminLoggedIn, getAllProducts);
export default router;
