export const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validTypes.includes(file.mimetype)) {
        throw new Error("Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed");
    }
    if (file.size > maxSize) {
        throw new Error("File size must not exceed 2MB");
    }
    return true;
};
