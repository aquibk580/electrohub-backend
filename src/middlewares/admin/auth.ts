import { NextFunction, Request, Response } from "express";
import { AdminPayload } from "../../types/Payload.js";
import jwt from "jsonwebtoken";

export async function isAdminLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      res
        .status(401)
        .json({
          error: "Unauthorized. No token provided.",
          flag: "NoAdminTokenProvided",
        });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      "email" in decoded &&
      "name" in decoded
    ) {
      req.admin = decoded as AdminPayload;
      next();
    } else {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ error: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token has expired." });
    } else {
      console.error("Authentication Error:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
}
