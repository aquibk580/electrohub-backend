import { Router } from "express";
import { sendMessage } from "../../controllers/user/contact.js";
const router = Router();
// Send message
router.post("/", sendMessage);
export default router;
