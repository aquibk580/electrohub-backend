import { Router } from "express";
import { sendMessage } from "../controllers/contact.js";

const router: Router = Router();

// Send message
router.post("/", sendMessage);

export default router;
