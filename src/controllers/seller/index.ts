import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { z, ZodSchema } from "zod";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";

interface Seller {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  address?: string | null;
  phone?: string | null;
  answer?: string | null;
  pfp: string;
}

// Delete seller account
async function deleteAccount(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const sellerId = parseInt(id, 10);

  if (!sellerId || isNaN(sellerId)) {
    res.status(400).json({ error: "Invalid or missing seller id" });
    return;
  }

  try {
    const seller: Seller | null = await db.seller.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }
    const deletedseller: Seller = await db.seller.delete({
      where: {
        id: sellerId,
      },
    });

    res.clearCookie("token", { httpOnly: true, secure: true });

    res.status(200).json({
      message: `Seller account of ${deletedseller.name} deleted successfully`,
      seller: deletedseller,
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

// Get details of a specific seller
async function getSellerDetails(req: Request, res: Response) {
  const { id } = req.params;
  const sellerId = parseInt(id, 10);

  if (isNaN(sellerId)) {
    res.status(400).json({ error: "Invalid or missing sellerId" });
    return;
  }

  try {
    const seller: Seller | null = await db.seller.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      res.status(404).json({ error: "seller not found" });
      return;
    }

    const { password: _, ...safeSellerData } = seller;

    res.status(200).json({ seller: safeSellerData });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_SELLER_DETAILS", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

type UpdateSellerType = {
  name?: string;
  address?: string | null;
  phone?: string | null;
  answer?: string | null;
  password?: string | null;
};

const sellerSchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  answer: z.string().min(1, "Address is required").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
});

const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const publicIdwithExtension = parts[parts.length - 1];
  return publicIdwithExtension.split(".")[0];
};
// Update seller details
async function updateSellerDetails(req: Request, res: Response) {
  const { id } = req.params;
  const sellerId = parseInt(id, 10);

  if (isNaN(sellerId)) {
    res.status(400).json({ error: "Invalid or missing sellerId" });
    return;
  }

  try {
    const { password, ...sellerData }: UpdateSellerType =
      await sellerSchema.parseAsync(req.body);

    const seller = await db.seller.findUnique({ where: { id: sellerId } });

    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }

    let updatedData: Partial<UpdateSellerType & { pfp?: string }> = {
      ...sellerData,
    };

    // Handle profile image update
    if (req.file) {
      if (seller.pfp) {
        const imagePublicId = extractPublicId(seller.pfp);
        if (imagePublicId) await cloudinary.uploader.destroy(imagePublicId);
      }

      updatedData.pfp = await uploadToCloudinary(
        req.file.buffer,
        process.env.SELLER_PFP_FOLDER!
      );
    }

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedSeller = await db.seller.update({
      where: { id: sellerId },
      data: updatedData,
    });

    const { password: _, ...safeSellerData } = updatedSeller;
    res.status(200).json({ seller: safeSellerData });
    return;
  } catch (error: any) {
    console.error("ERROR_WHILE_UPDATING_SELLER", error);

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

export { deleteAccount, getSellerDetails, updateSellerDetails };
