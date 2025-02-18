import multer from "multer";
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const files = req.files;
    const filesCount = files ? files.length : 0;
    if (filesCount > 5) {
        return cb(new Error("You can upload up to 5 files only."));
    }
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed."));
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: fileFilter,
});
export { upload };
