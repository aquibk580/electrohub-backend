import { Router } from "express";
import {
  createBannerCarousel,
  deleteBannerCarousel,
  getAllBannerCarousels,
  updateBannerCarousel,
} from "../../../controllers/admin/bannerCarousel.js";
import { upload } from "../../../lib/multer.js";

const router: Router = Router();

// Create banner carousel
router.post("/", upload.single("image"), createBannerCarousel);

// Get all banner carousels
router.get("/", getAllBannerCarousels);

// Update a specific banner carosuel
router.patch("/:id", upload.single("image"), updateBannerCarousel);

// Delete a specific banner carousel
router.delete("/:id", deleteBannerCarousel);

export default router;
