import Razorpay from "razorpay";
import { config } from "dotenv";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../../lib/db.js";
import { OrderStatus } from "@prisma/client";
config();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const orderSchema = z.object({
    total: z
        .number()
        .min(1, "Total amount is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "Total amount must be a valid number greater than zero",
    }),
    items: z
        .array(z.object({
        productId: z.number().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
    }))
        .min(1, "At least one product is required"),
});
async function placeOrder(req, res) {
    try {
        const orderData = await orderSchema.parse(req.body);
        const options = {
            amount: parseInt(orderData.total) * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            order,
            orderData,
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        if (generatedSignature === razorpay_signature) {
            const { orderData } = req.body;
            console.log(orderData);
            const { total, items } = orderData;
            const parsedTotal = parseInt(total, 10);
            const userId = parseInt(req.user.id);
            const order = await db.order.create({
                data: {
                    userId,
                    total: parsedTotal,
                    orderItems: {
                        create: items.map((item) => ({
                            productId: parseInt(item.productId),
                            quantity: parseInt(item.quantity),
                        })),
                    },
                },
                include: {
                    orderItems: true,
                },
            });
            const cart = await db.cart.findUnique({
                where: {
                    userId,
                },
            });
            await db.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                },
            });
            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                order,
            });
            return;
        }
        else {
            res
                .status(400)
                .json({ success: false, message: "Payment verification failed" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
async function getAllOrders(req, res) {
    try {
        const userId = parseInt(req.user.id);
        if (!userId) {
            res.status(400).json({ error: "User Id is required" });
            return;
        }
        const orders = await db.order.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                seller: true,
                                images: true,
                            },
                        },
                    },
                },
            },
        });
        const formattedOrders = orders.map((order) => ({
            ...order,
            orderItems: order.orderItems.map((item) => ({
                ...item,
                product: item.product,
            })),
        }));
        res.status(200).json(formattedOrders);
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_ORDERS", error);
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
                        seller: true,
                        images: true,
                    },
                },
            },
        });
        if (!orderItem) {
            res.status(404).json({ error: "Order item not found" });
            return;
        }
        res.status(200).json(orderItem);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_AN_ORDER", error);
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
        await db.orderItem.update({
            where: {
                id: orderItem.id,
            },
            data: {
                status: status,
            },
        });
        res.status(200).json({});
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
export { placeOrder, verifyPayment, getAllOrders, getSingleOrder, updateOrderStatus, };
