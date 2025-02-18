import { db } from "../../lib/db.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    answer: z.string().min(1, "Answer to security quetion is required"),
});
// Signup Controller
async function signup(req, res) {
    try {
        const userData = userSchema.parse(req.body);
        const existingUser = await db.user.findUnique({
            where: {
                email: userData.email,
            },
        });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await db.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
        });
        const { password: _, ...safeUserData } = user;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jwt.sign({ id: user.id, email: user.email, userType: "user" }, jwtSecret, { expiresIn: "7d" } // Token expires in 7 days
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res
            .status(201)
            .json({ message: "User created successfully", user: safeUserData });
        return;
    }
    catch (err) {
        if (err.name === "ZodError") {
            res.status(400).json({ error: err.errors }); // Validation errors
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" }); // General server error
        return;
    }
}
const userSignInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
// Signin Controller
async function signin(req, res) {
    try {
        const userData = await userSignInSchema.parse(req.body);
        const user = await db.user.findUnique({
            where: { email: userData.email },
        });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        if (!user.password) {
            res.status(400).json({ error: "Password is not present in the db" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const token = jwt.sign({ id: user.id, email: user.email, userType: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { password, ...safeUserData } = user;
        res
            .status(200)
            .json({ message: "Logged in successfully.", user: safeUserData });
    }
    catch (error) {
        console.error("Error during signin:", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
}
const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    answer: z.string().min(1, "Answer to security quetion is required"),
});
// Forgot password
async function forgotPassword(req, res) {
    try {
        const userData = await forgotPasswordSchema.parse(req.body);
        const user = await db.user.findUnique({
            where: {
                email: userData.email,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (userData.answer !== user.answer) {
            res
                .status(400)
                .json({ error: "Incorrect answer to the security quetion" });
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
    }
    catch (err) {
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
