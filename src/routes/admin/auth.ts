import { Router } from "express";
import {
  adminSignup,
  adminSignin,
  forgotPassword,
  adminLogout,
} from "../../controllers/admin/auth.js";
import { isAdminLoggedIn } from "../../middlewares/admin/auth.js";

const router: Router = Router();

// Admin Signup
router.post("/signup", adminSignup);

// Admin Signin
router.post("/signin", adminSignin);

// Admin logout
router.get("/logout", isAdminLoggedIn, adminLogout);

// forgot password route
router.post("/forgot-password", forgotPassword);

export default router;
