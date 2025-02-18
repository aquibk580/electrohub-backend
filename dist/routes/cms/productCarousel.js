import { Router } from "express";
import { getAllProductCarousels } from "../../controllers/cms/productCarousel.js";
const router = Router();
// Get all product carousels
router.get("/", getAllProductCarousels);
export default router;
