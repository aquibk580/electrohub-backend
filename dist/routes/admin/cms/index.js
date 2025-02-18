import { Router } from "express";
import categoryRoutes from "./category.js";
import bannerCarrouselRoutes from "./bannerCarousel.js";
import productCarrouselRoutes from "./productCarousel.js";
const router = Router();
// Category Routes
router.use("/categories", categoryRoutes);
// Banner Carousel Routes
router.use("/banner-carousel", bannerCarrouselRoutes);
// Product Carousel Routes
router.use("/product-carousel", productCarrouselRoutes);
export default router;
