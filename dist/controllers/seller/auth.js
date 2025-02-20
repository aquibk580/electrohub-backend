import bcrypt from "bcrypt";
import { db } from "../../lib/db.js";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { validateFile } from "../../lib/validateFile.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
const sellerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    answer: z.string().min(1, "Answer to security quetion is required"),
});
// Seller signup
async function signup(req, res) {
    try {
        const { password, ...sellerData } = await sellerSchema.parse(req.body);
        const image = req.file;
        if (!image) {
            res
                .status(400)
                .json({ error: "Profile picture is required", flag: "PFPIsRequired" });
            return;
        }
        try {
            validateFile(image);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        const existingSeller = await db.seller.findUnique({
            where: {
                email: sellerData.email,
            },
        });
        if (existingSeller) {
            res
                .status(400)
                .json({ error: "Email already exists", flag: "SellerExists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const pfpUrl = await uploadToCloudinary(image.buffer, process.env.SELLER_PFP_FOLDER);
        const seller = await db.seller.create({
            data: {
                ...sellerData,
                password: hashedPassword,
                pfp: pfpUrl,
            },
        });
        const token = jwt.sign({ id: seller.id, email: seller.email, userType: "seller" }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
    }
    catch (error) {
        console.error("Signup error:", error);
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
}
const sellerSignInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
// Seller signin
async function signin(req, res) {
    try {
        const sellerData = await sellerSignInSchema.parse(req.body);
        const seller = await db.seller.findUnique({
            where: { email: sellerData.email },
        });
        if (!seller || !seller.password) {
            res
                .status(404)
                .json({ error: "Seller not found.", flag: "SellerNotFound" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(sellerData.password, seller.password);
        if (!isPasswordCorrect) {
            res
                .status(401)
                .json({
                error: "Invalid email or password.",
                flag: "InvalidCredentials",
            });
            return;
        }
        const token = jwt.sign({ id: seller.id, email: seller.email, userType: "seller" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: "Logged in successfully." });
    }
    catch (error) {
        console.error("Signin error:", error);
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
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
        const sellerData = await forgotPasswordSchema.parse(req.body);
        const seller = await db.seller.findUnique({
            where: {
                email: sellerData.email,
            },
        });
        if (!seller) {
            res
                .status(404)
                .json({ error: "Seller not found", flag: "SellerNotFound" });
            return;
        }
        if (sellerData.answer !== seller.answer) {
            res
                .status(400)
                .json({ error: "Incorrect answer to the security quetion", flag: "InvalidCredentials" });
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
