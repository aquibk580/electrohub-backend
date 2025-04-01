import { Router } from "express";
import { Request, Response } from "express";
import multer from "multer";
import BackgroundRemoval from "@imgly/background-removal-node";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router: Router = Router();

router.post("/", upload.single("image"), async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, "./temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save uploaded file to temp directory
        const inputFilePath = path.join(tempDir, `${uuidv4()}-${req.file.originalname}`);
        fs.writeFileSync(inputFilePath, req.file.buffer);

        // Output file path
        const outputFilePath = path.join(tempDir, `${uuidv4()}-output.png`);

        // Convert the inputFilePath to a file:// URL
        const inputFileUrl = `file://${inputFilePath.replace(/\\/g, "/")}`;

        // Remove background using img.ly package with URL instead of file path
        const outputBlob = await BackgroundRemoval(inputFileUrl);
        fs.writeFileSync(outputFilePath, Buffer.from(await outputBlob.arrayBuffer()));

        // Read the output file
        const processedImage = fs.readFileSync(outputFilePath);
        const base64Image = processedImage.toString('base64');

        // Clean up temp files
        fs.unlinkSync(inputFilePath);
        fs.unlinkSync(outputFilePath);

        // Return the processed image
        res.json({
            message: "Background removed successfully",
            processedImage: base64Image,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error("Background removal error:", error);
        res.status(500).json({ 
            error: "Error processing image", 
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;