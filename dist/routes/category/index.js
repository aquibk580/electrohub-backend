import { Router } from "express";
import { getAllCategories } from "../../controllers/category/index.js";
const router = Router();
// Get all categories
router.get("/", getAllCategories);
export default router;
