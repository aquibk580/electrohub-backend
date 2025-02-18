import { db } from "../../lib/db.js";
async function getAllSellers(req, res) {
    try {
        const sellers = await db.seller.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
        if (sellers.length === 0) {
            res.status(404).json({ error: "No users available" });
            return;
        }
        res.status(200).json(sellers);
        return;
        // You can retrive the sellers at the frontend directly as "response.data" no need to do "response.data.sellers"
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_SELLERS", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function getSingleSeller(req, res) {
    try {
        const { sellerId } = req.params;
        const SellerId = parseInt(sellerId, 10);
        if (isNaN(SellerId)) {
            res.status(400).json({ error: "Seller Id is required" });
            return;
        }
        const seller = await db.seller.findUnique({
            where: {
                id: SellerId,
            },
        });
        if (!seller) {
            res.status(404).json({ error: "No users available" });
            return;
        }
        res.status(200).json(seller);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_SELLERS", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { getAllSellers, getSingleSeller };
