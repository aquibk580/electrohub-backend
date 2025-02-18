import { Request, Response } from "express";
import { db } from "../../lib/db.js";

interface User {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  answer?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  pfp?: string | null;
  provider?: string | null;
}

async function getAllUsers(req: Request, res: Response) {
  try {
    const users: Array<User> = await db.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (users.length === 0) {
      res.status(404).json({ error: "No users available" });
      return;
    }

    res.status(200).json(users);
    return;

    // You can retrive the users at the frontend directly as "response.data" no need to do "response.data.users"
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_USERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

async function getSingleUser(req: Request, res: Response) {
  const { userId } = req.params;
  const UserId = parseInt(userId, 10);
  try {
    const user: User | null = await db.user.findUnique({
      where: {
        id: UserId,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_USERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export { getAllUsers, getSingleUser };
