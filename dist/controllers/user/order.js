import Razorpay from "razorpay";
import { config } from "dotenv";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../../lib/db.js";
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
export { placeOrder, verifyPayment };
