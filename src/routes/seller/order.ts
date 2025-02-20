import { Router } from "express";
import { isLoggedIn, isSeller } from "../../middlewares/auth.js";
import { getAllOrders } from "../../controllers/seller/order.js";

const router: Router = Router();

// Get All orders of a particular seller
router.get("/", isLoggedIn, isSeller, getAllOrders);

export default router;
