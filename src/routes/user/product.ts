import { Router } from "express";
import {
  deleteReview,
  deleteReviewImage,
  getAllProducts,
  getSingleProduct,
  sendReview,
} from "../../controllers/user/product.js";
import { isLoggedIn } from "../../middlewares/auth.js";
import { upload } from "../../lib/multer.js";

const router: Router = Router();

// Get all products
router.get("/", getAllProducts);

// Get single Product
router.get("/:productId", getSingleProduct);

// review a product
router.post("/:productId/review", isLoggedIn, sendReview);

// Delete a review
router.delete("/review/:reviewId", isLoggedIn, deleteReview);

// Update a review
router.patch("/review/:reviewId", isLoggedIn, upload.array("images", 3));

// Delete a specific reviewImage
router.delete("/review/image/:imageId", isLoggedIn, deleteReviewImage);
export default router;
