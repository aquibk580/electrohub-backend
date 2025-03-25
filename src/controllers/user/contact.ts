import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db.js";

const messageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name is too long"),
  email: z.string().trim().email("Invalid email format"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters long")
    .max(100, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(3, "Message must be at least 3 characters long")
    .max(1000, "Message is too long"),
});

export async function sendMessage(req: Request, res: Response) {
  try {
    const messageData = messageSchema.parse(req.body);

    const recentMessage = await db.message.findFirst({
      where: { email: messageData.email },
      orderBy: { id: "desc" },
    });

    if (recentMessage) {
      const minutesSinceLastMessage =
        (Date.now() - new Date(recentMessage.createdAt).getTime()) / 60000;
      if (minutesSinceLastMessage < 5) {
        res
          .status(429)
          .json({ error: "Please wait before sending another message." });
        return;
      }
    }

    const message = await db.message.create({ data: messageData });

    res.status(201).json(message);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.errors ?? "Invalid request data" });
  }
}
