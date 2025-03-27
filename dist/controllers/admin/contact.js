import { db } from "../../lib/db.js";
// Get all messages
export async function getAllMessages(req, res) {
    try {
        const messages = await db.message.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        if (messages.length === 0) {
            res.status(200).json({ message: "No messages available" });
            return;
        }
        res.status(200).json(messages);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_MESSAGES");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
}
// Delete a single message
export async function deleteSingleMessage(req, res) {
    try {
        const params = req.params;
        const messageId = parseInt(params.messageId);
        if (!messageId) {
            res.status(400).json({ error: "Missing or Invalid message id" });
            return;
        }
        const message = await db.message.findUnique({
            where: {
                id: messageId,
            },
        });
        if (!message) {
            res.status(404).json({ error: "Message not found" });
            return;
        }
        await db.message.delete({
            where: {
                id: messageId,
            },
        });
        res.status(200).json({ message, Message: "Message deleted successfully" });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_DELETING_ALL_MESSAGES");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
}
