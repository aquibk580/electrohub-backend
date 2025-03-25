import { Router } from "express";
import { isAdminLoggedIn } from "../../../middlewares/admin/auth.js";
import { createCategory, deleteCategory, getAllCategories, getAllCategoriesWithCount, updateCategory, } from "../../../controllers/admin/category.js";
import { upload } from "../../../lib/multer.js";
const router = Router();
// Create Category
router.post("/", isAdminLoggedIn, upload.single("image"), createCategory);
// Get all categories
router.get("/", isAdminLoggedIn, getAllCategories);
// Get all categories with product caount
router.get("/productCount", isAdminLoggedIn, getAllCategoriesWithCount);
// Delete single category
router.delete("/:categoryName", isAdminLoggedIn, deleteCategory);
// Update Category
router.patch("/:categoryName", isAdminLoggedIn, upload.single("image"), updateCategory);
export default router;
