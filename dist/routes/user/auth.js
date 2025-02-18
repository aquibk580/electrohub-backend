import { Router } from "express";
import { signup, signin, forgotPassword, } from "../../controllers/user/auth.js";
const router = Router();
// User signup route
router.post("/signup", signup);
// User signin route
router.post("/signin", signin);
// forgot password route
router.post("/forgot-password", forgotPassword);
export default router;
