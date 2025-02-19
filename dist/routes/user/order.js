import { Router } from "express";
import { isLoggedIn } from "../../middlewares/auth.js";
import { getAllOrders, getSingleOrder, placeOrder, verifyPayment, } from "../../controllers/user/order.js";
const router = Router();
// Place an order
router.post("/place-order", isLoggedIn, placeOrder);
// Verify payment
router.post("/verify-payment", isLoggedIn, verifyPayment);
// Get all orders of a user
router.get("/", isLoggedIn, getAllOrders);
// Get specific order of a user
router.get("/:id", isLoggedIn, getSingleOrder);
export default router;
