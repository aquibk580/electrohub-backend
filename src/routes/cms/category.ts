import { Router } from "express";
import { getAllCategories } from "../../controllers/cms/category.js";

const router: Router = Router();

// Get all categories
router.get("/", getAllCategories);

export default router;
