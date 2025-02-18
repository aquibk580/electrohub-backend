import { db } from "../../lib/db.js";
// Add product to wishlist
async function addProductToWishlist(req, res) {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            res.status(400).json({ error: "Missing or invalid product Id" });
            return;
        }
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        let wishlist = await db.wishlist.findUnique({
            where: { userId: parsedUserId },
        });
        if (wishlist) {
            wishlist = await db.wishlist.update({
                where: { userId: parsedUserId },
                data: {
                    products: {
                        connect: { id: productId },
                    },
                },
            });
        }
        else {
            wishlist = await db.wishlist.create({
                data: {
                    userId: parsedUserId,
                    products: {
                        connect: { id: productId },
                    },
                },
            });
        }
        res.status(200).json({ message: "Item added to wishlist", wishlist });
        return;
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Remove product from wishlist
async function removeProductFromWishlist(req, res) {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            res.status(400).json({ error: "Missing or invalid product Id" });
            return;
        }
        const userId = req.user.id;
        const parsedUserId = parseInt(userId, 10);
        const wishlist = await db.wishlist.update({
            where: { userId: parsedUserId },
            data: {
                products: {
                    disconnect: { id: productId },
                },
            },
        });
        res.status(200).json({ message: "Item removed from wishlist", wishlist });
        return;
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
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
                products: true,
            },
        });
        if (!wishlist) {
            res.status(404).json({ error: "Wishlist not found" });
            return;
        }
        res.status(200).json({ wishlist });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { addProductToWishlist, removeProductFromWishlist, getAllProductsFromWishlist, };
