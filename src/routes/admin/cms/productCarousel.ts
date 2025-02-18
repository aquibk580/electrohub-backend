import { Router } from "express";
import { isAdminLoggedIn } from "../../../middlewares/admin/auth.js";
import { upload } from "../../../lib/multer.js";
import {
  createProductCarousel,
  deleteProductCarousel,
  getAllProductCarousels,
  updateProductCarousel,
} from "../../../controllers/admin/productCarousel.js";

const router: Router = Router();

// Create product carousel
router.post(
  "/",
  isAdminLoggedIn,
  upload.single("image"),
  createProductCarousel
);

// Get all product carousels
router.get("/", isAdminLoggedIn, getAllProductCarousels);

// Update a specific product carosuel
router.patch(
  "/:id",
  isAdminLoggedIn,
  upload.single("image"),
  updateProductCarousel
);

// Delete a specific product carousel
router.delete("/:id", isAdminLoggedIn, deleteProductCarousel);

export default router;
