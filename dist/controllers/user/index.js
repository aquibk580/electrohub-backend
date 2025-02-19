import bcrypt from "bcrypt";
import { db } from "../../lib/db.js";
import { z } from "zod";
// Delete User Account Controller
async function deleteAccount(req, res) {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid or missing user id" });
        return;
    }
    try {
        const user = db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const deletedUser = await db.user.delete({
            where: {
                id: userId,
            },
        });
        res.clearCookie("token", { httpOnly: true, secure: true });
        res.status(200).json({
            message: `User account of ${deletedUser.name} deleted successfully`,
            user: deletedUser,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_DELETING_ACCOUNT", error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Get a details of a specific user
async function getUserDetails(req, res) {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid or missing userId" });
        return;
    }
    try {
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const { password: _, ...safeUserData } = user;
        res.status(200).json({ user: safeUserData });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_USER_DETAILS", error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
const userSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
    answer: z.string().min(1, "Answer is required").optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .optional(),
    gender: z
        .enum(["Male", "Female"], {
        message: "Gender must be either male or female",
    })
        .optional(),
});
// Update user details
async function updateUserDetails(req, res) {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid or missing userId" });
        return;
    }
    try {
        const userData = await userSchema.parseAsync(req.body);
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const updatedData = { ...userData };
        if (userData.password) {
            updatedData.password = await bcrypt.hash(userData.password, 10);
        }
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: updatedData,
        });
        const { password: _, ...safeUserData } = updatedUser;
        res.status(200).json({ user: safeUserData });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_UPDATING_USER", error);
        if (error.name === "ZodError") {
            res.status(400).json({ errors: error.errors });
            return;
        }
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
        return;
    }
}
export { deleteAccount, getUserDetails, updateUserDetails };
