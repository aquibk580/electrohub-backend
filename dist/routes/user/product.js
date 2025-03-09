import { Router } from "express";
import { deleteReview, getAllProducts, getSingleProduct, getUserReviews, sendReview, updateReview, } from "../../controllers/user/product.js";
import { isLoggedIn } from "../../middlewares/auth.js";
const router = Router();
// Get all products
router.get("/", getAllProducts);
// Get single Product
router.get("/:productId", getSingleProduct);
// review a product
router.post("/:productId/review", isLoggedIn, sendReview);
// Get reviews of a specific user
router.get("/review/reviews", isLoggedIn, getUserReviews);
// Delete a review
router.delete("/review/:reviewId", isLoggedIn, deleteReview);
// Update a review
router.patch("/review/:reviewId", isLoggedIn, updateReview);
export default router;
