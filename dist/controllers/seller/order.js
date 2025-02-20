import { db } from "../../lib/db.js";
async function getAllOrders(req, res) {
    try {
        const sellerId = Number.parseInt(req.user.id, 10);
        if (isNaN(sellerId)) {
            res.status(400).json({ error: "Invalid or missing seller id" });
            return;
        }
        console.log(sellerId);
        const orders = await db.order.findMany({
            where: {
                orderItems: {
                    some: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                },
            },
            include: {
                user: true,
                orderItems: {
                    where: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                    include: {
                        product: {
                            include: {
                                seller: true,
                                images: true,
                                productInfo: true,
                            },
                        },
                    },
                },
            },
        });
        const filteredOrders = orders.filter((order) => order.orderItems.length > 0);
        res.status(200).json(filteredOrders);
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
export { getAllOrders };
