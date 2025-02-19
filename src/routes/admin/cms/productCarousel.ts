import { Router } from "express";
import { upload } from "../../../lib/multer.js";
import {
  createProductCarousel,
  deleteProductCarousel,
  getAllProductCarousels,
  updateProductCarousel,
} from "../../../controllers/admin/productCarousel.js";

const router: Router = Router();

// Create product carousel
router.post("/", upload.single("image"), createProductCarousel);

// Get all product carousels
router.get("/", getAllProductCarousels);

// Update a specific product carosuel
router.patch("/:id", upload.single("image"), updateProductCarousel);

// Delete a specific product carousel
router.delete("/:id", deleteProductCarousel);

export default router;
