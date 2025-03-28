import { Router } from "express";
import { isLoggedIn, isSeller } from "../../middlewares/auth.js";
import { getAllOrdersData, getSingleOrder, updateOrderStatus, } from "../../controllers/seller/order.js";
const router = Router();
// Get All orders of a particular seller
router.get("/", isLoggedIn, isSeller, getAllOrdersData);
// Update order status
router.patch("/:id", isLoggedIn, isSeller, updateOrderStatus);
// Get Specific OrderItem
router.get("/:id", isLoggedIn, isSeller, getSingleOrder);
export default router;
