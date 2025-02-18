import { Router } from "express";
import {
  deleteReview,
  deleteReviewImage,
  getAllProducts,
  sendReview,
} from "../../controllers/user/product.js";
import { isLoggedIn } from "../../middlewares/auth.js";
import { upload } from "../../lib/multer.js";

const router: Router = Router();

// Get all products
router.get("/", getAllProducts);

// review a product
router.post(
  "/:productId/review",
  isLoggedIn,
  upload.array("images", 3),
  sendReview
);

// Delete a review
router.delete("/review/:reviewId", isLoggedIn, deleteReview);

// Update a review
router.patch("/review/:reviewId", isLoggedIn, upload.array("images", 3));

// Delete a specific reviewImage
router.delete("/review/image/:imageId", isLoggedIn, deleteReviewImage);
export default router;
