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
      "Invalid file type. Only JPEG, PNG, JPG, GIF, and WEBP are allowed"
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size must not exceed 5MB");
  }

  return true;
};

export const checkFileCount = (req: Request, res: Response, next: Function) => {
  if (!req.files) {
    return next();
  }

  const files = req.files as Express.Multer.File[];
  if (files.length > 5) {
    return res
      .status(400)
      .json({ error: "You can upload up to 5 files only." });
  }

  next();
};
