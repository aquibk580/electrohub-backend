import { Router } from "express";
import { getAllBannerCarousels } from "../../controllers/cms/bannerCarousel.js";

const router: Router = Router();

// Get all bannerCarousels
router.get("/", getAllBannerCarousels);

export default router;
