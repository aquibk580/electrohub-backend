import { Router } from "express";
import { upload } from "../../lib/multer.js";
import { signup, signin, forgotPassword, } from "../../controllers/seller/auth.js";
const router = Router();
// Seller signup route
router.post("/signup", upload.single("pfp"), signup);
// Seller signin route
router.post("/signin", signin);
// Forgot password route
router.post("/forgot-password", forgotPassword);
export default router;
