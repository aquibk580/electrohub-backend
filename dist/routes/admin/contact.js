import { Router } from "express";
import { deleteSingleMessage, getAllMessages, } from "../../controllers/admin/contact.js";
const router = Router();
// Get all messages
router.get("/", getAllMessages);
// delete a single message
router.delete("/:messageId", deleteSingleMessage);
export default router;
