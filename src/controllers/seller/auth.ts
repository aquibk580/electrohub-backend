import bcrypt from "bcrypt";
import { db } from "../../lib/db.js";
import { Request, Response } from "express";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { validateFile } from "../../lib/validateFile.js";
import { ZodSchema, z } from "zod";
import jwt from "jsonwebtoken";

const sellerSchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  answer: z.string().min(1, "Answer to security quetion is required"),
});

interface Seller {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  answer: string;
}

// Seller signup
async function signup(req: Request, res: Response) {
  try {
    const { password, ...sellerData }: Seller = await sellerSchema.parse(
      req.body
    );

    const image = req.file;

    if (!image) {
      res.status(400).json({ error: "Profile picture is required" });
      return;
    }
    try {
      validateFile(image);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
      return;
    }

    const existingSeller = await db.seller.findUnique({
      where: {
        email: sellerData.email,
      },
    });

    if (existingSeller) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pfpUrl = await uploadToCloudinary(
      image.buffer,
      process.env.SELLER_PFP_FOLDER!
    );

    const seller = await db.seller.create({
      data: {
        ...sellerData,
        password: hashedPassword,
        pfp: pfpUrl,
      },
    });

    const token = jwt.sign(
      { id: seller.id, email: seller.email, userType: "seller" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeSellerData } = seller;

    res.status(201).json({
      message: "Signup successful",
      seller: safeSellerData,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }

    if (error.code === "P2002") {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

const sellerSignInSchema: ZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface SellerSignIn {
  email: string;
  password: string;
}

// Seller signin
async function signin(req: Request, res: Response): Promise<void> {
  try {
    const sellerData: SellerSignIn = await sellerSignInSchema.parse(req.body);

    const seller = await db.seller.findUnique({
      where: { email: sellerData.email },
    });

    if (!seller || !seller.password) {
      res.status(404).json({ error: "Seller not found." });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      sellerData.password,
      seller.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { id: seller.id, email: seller.email, userType: "seller" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Logged in successfully." });
  } catch (error: any) {
    console.error("Signin error:", error);

    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

interface ForgotPassword {
  email: string;
  password: string;
  answer: string;
}

const forgotPasswordSchema: ZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  answer: z.string().min(1, "Answer to security quetion is required"),
});

// Forgot password
async function forgotPassword(req: Request, res: Response) {
  try {
    const sellerData: ForgotPassword = await forgotPasswordSchema.parse(
      req.body
    );

    const seller = await db.seller.findUnique({
      where: {
        email: sellerData.email,
      },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }

    if (sellerData.answer !== seller.answer) {
      res
        .status(400)
        .json({ error: "Incorrect answer to the security quetion" });
      return;
    }

    const hashedPassword = await bcrypt.hash(sellerData.password, 10);

    const updatedSeller = await db.seller.update({
      where: {
        email: sellerData.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    const { password, ...safeSellerData } = updatedSeller;

    res.status(200).json({ seller: safeSellerData });
    return;
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

export { signup, signin, forgotPassword };
