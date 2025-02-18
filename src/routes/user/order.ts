import { Router } from "express";
import { isLoggedIn } from "../../middlewares/auth.js";
import { placeOrder, verifyPayment } from "../../controllers/user/order.js";

const router: Router = Router();

// Place an order
router.post("/place-order", placeOrder);

// Verify payment
router.post("/verify-payment", verifyPayment);

export default router;
