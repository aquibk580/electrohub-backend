import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { ZodSchema, z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  answer: z.string().min(1, "Answer to security quetion is required"),
});

interface User {
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  answer: string;
}

// Signup Controller
async function signup(req: Request, res: Response): Promise<void> {
  try {
    const userData: User = userSchema.parse(req.body);

    const existingUser = await db.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ error: "Email already exists", flag: "UserExists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const hashedAnswer = await bcrypt.hash(userData.answer, 10);

    const user = await db.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        answer: hashedAnswer,
      },
    });

    const { password: _, ...safeUserData } = user;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, userType: "user" },
      jwtSecret,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: safeUserData });
    return;
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors }); // Validation errors
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" }); // General server error
    return;
  }
}

const userSignInSchema: ZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface UserSignIn {
  email: string;
  password: string;
}

// Signin Controller
async function signin(req: Request, res: Response): Promise<void> {
  try {
    const userData: UserSignIn = await userSignInSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found.", flag: "UserNotFound" });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        error: "Password is not present in the db",
        flag: "PasswordNotFound",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({
        error: "Invalid email or password",
        flag: "InvalidCredentials",
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, userType: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...safeUserData } = user;

    res
      .status(200)
      .json({ message: "Logged in successfully.", user: safeUserData });
  } catch (error: any) {
    console.error("Error during signin:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
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
    const userData: ForgotPassword = await forgotPasswordSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found", flag: "UserNotFound" });
      return;
    }

    if (!user.answer) {
      res.status(400).json({ error: "Answer not found" });
      return;
    }

    const isCorrect = await bcrypt.compare(userData.answer, user.answer);

    if (!isCorrect) {
      res.status(400).json({
        error: "Incorrect answer to the security quetion",
        flag: "InvalidCredentials",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const updatedUser = await db.user.update({
      where: {
        email: userData.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    const { password, ...safeUserData } = updatedUser;

    res.status(200).json({ user: safeUserData });
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
