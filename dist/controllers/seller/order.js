import { db } from "../../lib/db.js";
import { OrderStatus } from "@prisma/client";
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
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const orderItemId = parseInt(id, 10);
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ error: "Status is required" });
            return;
        }
        if (isNaN(orderItemId)) {
            res.status(400).json({ error: "Missing or invalid order item id" });
            return;
        }
        if (!Object.values(OrderStatus).includes(status)) {
            res.status(400).json({ error: "Invalid status value" });
            return;
        }
        const orderItem = await db.orderItem.findUnique({
            where: {
                id: orderItemId,
            },
        });
        if (!orderItem) {
            res.status(404).json({ error: "Order item not found" });
            return;
        }
        const updatedOrderItem = await db.orderItem.update({
            where: {
                id: orderItem.id,
            },
            data: {
                status: status,
            },
        });
        res.status(200).json({ status: updatedOrderItem.status });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_UPDATING_ORDER_STATUS", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function getSingleOrder(req, res) {
    try {
        const { id } = req.params;
        const orderItemId = parseInt(id, 10);
        if (isNaN(orderItemId)) {
            res.status(400).json({ error: "Invalid or missing order item id" });
            return;
        }
        const orderItem = await db.orderItem.findUnique({
            where: {
                id: orderItemId,
            },
            include: {
                product: {
                    include: {
                        images: true,
                        productInfo: true,
                    },
                },
            },
        });
        if (!orderItem) {
            res.status(400).json({ error: "Order item not found" });
            return;
        }
        res.status(200).json(orderItem);
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
export { getAllOrders, updateOrderStatus, getSingleOrder };
