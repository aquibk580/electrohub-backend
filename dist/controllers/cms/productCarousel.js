import { db } from "../../lib/db.js";
// Get all product carousels
export async function getAllProductCarousels(req, res) {
    try {
        const productCarousel = await db.productCarousel.findMany({});
        if (productCarousel.length === 0) {
            res.status(404).json({ error: "No Product Carousel Item Available" });
            return;
        }
        res.status(200).json(productCarousel);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_PRODUCT_CAROUSELS");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
