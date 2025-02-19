import { Router } from "express";
import categoryRoutes from "./category.js";
import bannerCarrouselRoutes from "./bannerCarousel.js";
import productCarrouselRoutes from "./productCarousel.js";
import { isAdminLoggedIn } from "../../../middlewares/admin/auth.js";

const router: Router = Router();

// Category Routes
router.use("/categories", isAdminLoggedIn, categoryRoutes);

// Banner Carousel Routes
router.use("/banner-carousels", isAdminLoggedIn, bannerCarrouselRoutes);

// Product Carousel Routes
router.use("/product-carousels", isAdminLoggedIn, productCarrouselRoutes);

export default router;
