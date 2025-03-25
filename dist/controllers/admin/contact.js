import { db } from "../../lib/db.js";
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
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
}
