import { Router } from "express";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";
import { getAllUsers, getSingleUser } from "../../controllers/admin/user.js";
const router = Router();
// Get all users
router.get("/", isAdminLoggedIn, getAllUsers);
// Get single user
router.get("/:userId", isAdminLoggedIn, getSingleUser);
export default router;
