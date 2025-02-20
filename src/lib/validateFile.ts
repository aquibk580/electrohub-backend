import { Request, Response, NextFunction } from "express";

export const validateFile = (file: Express.Multer.File) => {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed"
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size must not exceed 5MB");
  }

  return true;
};

export const checkFileCount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || (req.files as Express.Multer.File[]).length > 5) {
    res.status(400).json({ message: "You can upload up to 5 files only." });
    return;
  }
  next();
};
