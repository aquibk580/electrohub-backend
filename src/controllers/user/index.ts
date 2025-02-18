import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { ZodSchema, z } from "zod";

interface User {
  name: string;
  email: string;
  password?: string | null;
  address?: string | null;
  phone?: string | null;
  answer?: string | null;
}

// Delete User Account Controller
async function deleteAccount(req: Request, res: Response): Promise<void> {
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

    const deletedUser: User = await db.user.delete({
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
  } catch (error: any) {
    console.log("ERROR_WHILE_DELETING_ACCOUNT", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

// Get a details of a specific user
async function getUserDetails(req: Request, res: Response) {
  const { id } = req.params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid or missing userId" });
    return;
  }

  try {
    const user: User | null = await db.user.findUnique({
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
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_USER_DETAILS", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

const userSchema: ZodSchema = z.object({
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

type UpdateUserType = {
  name?: string;
  address?: string;
  phone?: string;
  answer?: string;
  password?: string;
  gender?: "Male" | "Female";
};

// Update user details
async function updateuserDetails(req: Request, res: Response) {
  const { id } = req.params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid or missing userId" });
    return;
  }

  try {
    const userData: UpdateUserType = await userSchema.parse(req.body);
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found " });
      return;
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const updatedUser = await db.user.update({
        where: {
          id: userId,
        },
        data: { password: hashedPassword, ...userData },
      });

      const { password: _, ...safeUserData } = updatedUser;

      res.status(200).json({ user: safeUserData });
      return;
    }

    const updatedUser: User = await db.user.update({
      where: {
        id: userId,
      },
      data: { ...userData },
    });

    const { password: _, ...safeUserData } = updatedUser;

    res.status(200).json({ user: safeUserData });
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_UPDATING_USER", error);

    if (error.name === "ZodError") {
      res.status(400).json({ errors: error.errors });
      return;
    }

    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

export { deleteAccount, getUserDetails, updateuserDetails };
