import { db } from "../../lib/db.js";
// Add & Remove product to wishlist
async function toggleWishlist(req, res) {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            res.status(400).json({ error: "Invalid product ID" });
            return;
        }
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        let wishlist = await db.wishlist.findUnique({
            where: { userId: parsedUserId },
            include: { WishlistProduct: true },
        });
        if (!wishlist) {
            wishlist = await db.wishlist.create({
                data: {
                    userId: parsedUserId,
                },
            });
        }
        const existingWishlistProduct = await db.wishlistProduct.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId: productId,
                },
            },
        });
        if (existingWishlistProduct) {
            await db.wishlistProduct.delete({
                where: {
                    wishlistId_productId: {
                        wishlistId: wishlist.id,
                        productId: productId,
                    },
                },
            });
            res.status(200).json({
                message: "Item removed from wishlist",
                isWishlisted: false,
            });
            return;
        }
        else {
            await db.wishlistProduct.create({
                data: {
                    wishlistId: wishlist.id,
                    productId: productId,
                },
            });
            res.status(200).json({
                message: "Item added to wishlist",
                isWishlisted: true,
            });
            return;
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}
// Get all products from the wishlist
async function getAllProductsFromWishlist(req, res) {
    try {
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        const wishlist = await db.wishlist.findUnique({
            where: { userId: parsedUserId },
            include: {
                WishlistProduct: {
                    include: {
                        product: {
                            include: { images: true },
                        },
                    },
                },
            },
        });
        if (!wishlist) {
            res.status(200).json({ products: [] });
            return;
        }
        const products = wishlist.WishlistProduct.map((wp) => wp.product);
        if (products.length === 0) {
            res.status(200).json({ products: [] });
            return;
        }
        res.status(200).json({ products });
        return;
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// get ids of the wishlisted products
async function getWishlist(req, res) {
    try {
        const userId = req.user.id;
        const wishlist = await db.wishlist.findUnique({
            where: { userId: parseInt(userId, 10) },
            include: { WishlistProduct: true },
        });
        if (!wishlist) {
            res.status(200).json({ wishlist: [] });
            return;
        }
        const wishlistProductIds = wishlist.WishlistProduct.map((wp) => wp.productId);
        res.status(200).json({ wishlist: wishlistProductIds });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}
export { toggleWishlist, getAllProductsFromWishlist, getWishlist };
