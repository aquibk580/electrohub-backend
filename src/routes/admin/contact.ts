import { Router } from "express";
import { getAllMessages } from "../../controllers/admin/contact.js";

const router: Router = Router();

// Get all messages
router.get("/", getAllMessages);

export default router;
