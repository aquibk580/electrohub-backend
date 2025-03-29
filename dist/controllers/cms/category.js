import { db } from "../../lib/db.js";
// Get all categories
export async function getAllCategories(req, res) {
    try {
        const params = req.params;
        let categories;
        if (params.count === "all") {
            categories = await db.category.findMany({
                orderBy: {
                    createdAt: "asc",
                },
            });
        }
        else {
            const count = parseInt(params.count, 10);
            categories = await db.category.findMany({
                take: count,
                orderBy: {
                    createdAt: "asc",
                },
            });
        }
        if (categories.length === 0) {
            res.status(404).json({ error: "Categories not available" });
            return;
        }
        res.status(200).json(categories);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_CATEGORIES", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
