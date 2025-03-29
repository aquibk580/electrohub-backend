import { Router } from "express";
import { getAllCategories } from "../../controllers/cms/category.js";
const router = Router();
// Get all categories
router.get("/:count", getAllCategories);
export default router;
