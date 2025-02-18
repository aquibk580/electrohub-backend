import { Router } from "express";
import { isAdminLoggedIn } from "../../../middlewares/admin/auth.js";
import { createBannerCarousel, deleteBannerCarousel, getAllBannerCarousels, updateBannerCarousel, } from "../../../controllers/admin/bannerCarousel.js";
import { upload } from "../../../lib/multer.js";
const router = Router();
// Create banner carousel
router.post("/", isAdminLoggedIn, upload.single("image"), createBannerCarousel);
// Get all banner carousels
router.get("/", isAdminLoggedIn, getAllBannerCarousels);
// Update a specific banner carosuel
router.patch("/:id", isAdminLoggedIn, upload.single("image"), updateBannerCarousel);
// Delete a specific banner carousel
router.delete("/:id", isAdminLoggedIn, deleteBannerCarousel);
export default router;
