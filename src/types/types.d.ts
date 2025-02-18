import * as express from "express";
import "express-session";
import { AdminPayload, UserPayload } from "./Payload";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      admin?: AdminPayload;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userType?: string;
  }
}
