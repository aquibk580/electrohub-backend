export const validateFile = (file) => {
    const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.mimetype)) {
        throw new Error("Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed");
    }
    if (file.size > maxSize) {
        throw new Error("File size must not exceed 5MB");
    }
    return true;
};
export const checkFileCount = (req, res, next) => {
    if (!req.files || req.files.length > 5) {
        res.status(400).json({ message: "You can upload up to 5 files only." });
        return;
    }
    next();
};
