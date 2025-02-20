import { Router } from "express";
import { isLoggedIn, isSeller } from "../../middlewares/auth.js";
import {
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
} from "../../controllers/seller/order.js";

const router: Router = Router();

// Get All orders of a particular seller
router.get("/", isLoggedIn, isSeller, getAllOrders);

// Update order status
router.patch("/:id", isLoggedIn, isSeller, updateOrderStatus);

// Get Specific OrderItem
router.get("/:id", isLoggedIn, isSeller, getSingleOrder);

export default router;
