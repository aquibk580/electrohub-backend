import { Router } from "express";
import { isAdminLoggedIn } from "../../../middlewares/admin/auth.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../../../controllers/admin/category.js";
import { upload } from "../../../lib/multer.js";

const router: Router = Router();

// Create Category
router.post("/", isAdminLoggedIn, upload.single("image"), createCategory);

// Get all categories
router.get("/", isAdminLoggedIn, getAllCategories);

// Delete single category
router.delete("/:categoryName", isAdminLoggedIn, deleteCategory);

// Update Category
router.patch(
  "/:categoryName",
  isAdminLoggedIn,
  upload.single("image"),
  updateCategory
);

export default router;
