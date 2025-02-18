import { Request, Response } from "express";
import { UserPayload } from "../types/Payload.js";

export async function checkUserType(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as UserPayload | undefined;

    if (user) {
      if (user.userType === "user") {
        res.status(200).json({
          isLoggedIn: true,
          userType: user.userType,
          userId: user.id,
          email: user.email,
        });
        return;
      } else if (user.userType === "seller") {
        res.status(200).json({
          isLoggedIn: true,
          userType: user.userType,
          sellerId: user.id,
          email: user.email,
        });
        return;
      }
    } else {
      res.status(200).json({
        isLoggedIn: false,
        userType: null,
        userId: null,
        email: null,
      });
      return;
    }
  } catch (error: any) {
    console.log("ERROR_WHILE_CHEKING_LOGIN_STATUS");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }

  return;
}

