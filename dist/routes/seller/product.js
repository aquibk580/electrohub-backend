import { Router } from "express";
import { isLoggedIn, isSeller } from "../../middlewares/auth.js";
import { createProduct, deleteProduct, deleteProductImage, deleteProductPermanently, getAllProducts, getSingleProduct, updateProduct, } from "../../controllers/seller/product.js";
import { upload } from "../../lib/multer.js";
const router = Router();
// Create product with seller id
router.post("/:sellerId", isLoggedIn, isSeller, upload.array("images", 5), createProduct);
// Get single product of a seller
router.get("/single-product/:productId", isLoggedIn, isSeller, getSingleProduct);
// Get All products of a particular seller
router.get("/:sellerId", isLoggedIn, isSeller, getAllProducts);
// Delete a specific product of a seller
router.delete("/:productId", isLoggedIn, isSeller, deleteProduct);
// Delete a product permanantly
router.delete("/del-permanent/:productId", isLoggedIn, isSeller, deleteProductPermanently);
// Update a specific product of a seller
router.patch("/:productId", isLoggedIn, isSeller, upload.array("images", 5), updateProduct);
// Delete single image of a product
router.delete("/image/:imageId", isLoggedIn, isSeller, deleteProductImage);
export default router;
