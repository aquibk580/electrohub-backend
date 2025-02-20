import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../lib/db.js";
/* Notice in the below signup controller i am taking a secret key from the req.body.
It is there for the purpose of restricting the other unwanted people to create admin accounts.
If anyone wants to become an admin then they have to provide a secret key which only the mainAdmin knows.
So Admin account can be created only in the presence of the main Admin*/
const adminSignupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    secretKey: z.string().min(6, "Secret key must be at least 6 characters"),
});
// Admin Signup Route
async function adminSignup(req, res) {
    try {
        const { email, password, secretKey, name } = await adminSignupSchema.parse(req.body);
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            res.status(401).json({
                error: "Invalid admin secret key",
                flag: "InvadlidCredentials",
            });
            return;
        }
        const existingAdmin = await db.admin.findUnique({
            where: {
                email: email,
            },
        });
        if (existingAdmin) {
            res
                .status(400)
                .json({ error: "Admin already exists ", flag: "AdminExists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await db.admin.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            },
        });
        const { password: _, ...safeData } = admin;
        const adminToken = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, process.env.JWT_SECRET);
        res.cookie("adminToken", adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res
            .status(201)
            .json({ message: "Admin created successfully", admin: safeData });
        return;
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
const adminSigninSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
// Admin Signin Route
async function adminSignin(req, res) {
    try {
        const { email, password } = adminSigninSchema.parse(req.body);
        const admin = await db.admin.findUnique({
            where: {
                email: email,
            },
        });
        if (!admin) {
            res.status(401).json({ error: "Admin not found", flag: "AdminNotFound" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            res
                .status(401)
                .json({ error: "Invalid Credentials", flag: "InvadlidCredentials" });
            return;
        }
        const adminToken = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, process.env.JWT_SECRET);
        res.cookie("adminToken", adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { password: _, ...safeData } = admin;
        res
            .status(200)
            .json({ message: "Logged in successfully", admin: safeData });
        return;
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
    secretKey: z
        .string()
        .min(6, "Admin secret key must be at least 6 characters"),
});
// Forgot password
async function forgotPassword(req, res) {
    try {
        const adminData = await forgotPasswordSchema.parse(req.body);
        const admin = await db.admin.findUnique({
            where: {
                email: adminData.email,
            },
        });
        if (!admin) {
            res.status(404).json({ error: "Admin not found", flag: "AdminNotFound" });
            return;
        }
        if (adminData.secretKey !== process.env.ADMIN_SECRET_KEY) {
            res
                .status(400)
                .json({
                error: "Incorrect Admin Secret key",
                flag: "InvadlidCredentials",
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const updatedAdmin = await db.admin.update({
            where: {
                email: adminData.email,
            },
            data: {
                password: hashedPassword,
            },
        });
        const { password, ...safeAdminData } = updatedAdmin;
        res.status(200).json({ admin: safeAdminData });
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
// Admin Logout
function adminLogout(req, res) {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        res.status(200).json({ message: "Logged Out successfully" });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_LOGOUT");
        res.status(500).json({ error: "Internal Sever Error" });
        return;
    }
}
export { adminSignup, adminSignin, forgotPassword, adminLogout };
