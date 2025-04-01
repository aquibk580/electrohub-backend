import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/Payload";

export async function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.token;

    if (!token) {
      res
        .status(401)
        .json({
          error: "Unauthorized. No token provided.",
          flag: "NoTokenProvided",
        });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      "email" in decoded &&
      "userType" in decoded
    ) {
      req.user = decoded as UserPayload;
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

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token;

    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      "email" in decoded &&
      "userType" in decoded
    ) {
      req.user = decoded as UserPayload;
    } else {
      req.user = undefined;
    }
  } catch (error: any) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      req.user = undefined;
    } else {
      console.error("Authentication Error:", error);
    }
  }

  next();
}

export function isUser(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as UserPayload;
  if (user && user.userType === "user") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. User access required." });
  }
}

export function isSeller(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = req.user as UserPayload;
  if (user && user.userType === "seller") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Seller access required." });
  }
}

export async function isSameEntity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    res.status(400).json({ error: "Invalid or missing user or seller ID" });
    return;
  }

  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: "Unauthorized: Missing token" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    if (!decoded.id) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    if (parseInt(decoded.id, 10) !== parsedId) {
      res.status(401).json({ error: "Unauthorized: ID mismatch" });
      return;
    }

    next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
