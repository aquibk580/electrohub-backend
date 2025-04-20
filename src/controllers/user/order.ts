import Razorpay from "razorpay";
import { config } from "dotenv";
import crypto from "crypto";
import { Request, Response } from "express";
import { z, ZodSchema } from "zod";
import { db } from "../../lib/db.js";
import { UserPayload } from "../../types/Payload";
import { OrderStatus } from "@prisma/client";

config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface OrderInput {
  total: string;
  items: [{ productId: string; quantity: string }];
}

const orderSchema: ZodSchema = z.object({
  total: z
    .number()
    .min(1, "Total amount is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Total amount must be a valid number greater than zero",
    }),
  items: z
    .array(
      z.object({
        productId: z.number().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one product is required"),
});

async function placeOrder(req: Request, res: Response) {
  try {
    const orderData: OrderInput = await orderSchema.parse(req.body);

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
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

async function verifyPayment(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const userId = parseInt((req.user as UserPayload).id);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
      flag,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
      return;
    }

    let total: number;
    let items: { productId: number; quantity: number }[];

    if (flag === "buy") {
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        res.status(400).json({ success: false, message: "Invalid order data" });
        return;
      }

      total = parseInt(orderData.total, 10);
      items = orderData.items.map((item: any) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
      }));
    } else if (flag === "cart") {
      // "Cart Checkout" scenario: Fetch order from the cart
      const cart = await db.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        res.status(404).json({ success: false, message: "Cart is empty" });
        return;
      }

      total = cart.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      );
      items = cart.items.map((cartItem) => ({
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
      }));

      // Clear the cart only if it's a cart checkout
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid flag provided" });
      return;
    }

    // Create the order
    const order = await db.order.create({
      data: {
        userId,
        total,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    // Update product stock
    await db.$transaction([
      ...items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      db.product.updateMany({
        where: { stock: 0 },
        data: { status: "OutOfStock" },
      }),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully", order });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

async function getAllOrders(req: Request, res: Response) {
  try {
    const userId = parseInt((req.user as UserPayload).id);

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
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                images: {
                  take: 1,
                  orderBy: {
                    id: "asc",
                  },
                },
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
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_ORDERS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

async function getSingleOrder(req: Request, res: Response) {
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
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_AN_ORDER", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderItemId = parseInt(id, 10);
    const { status }: { status: string } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    if (isNaN(orderItemId)) {
      res.status(400).json({ error: "Missing or invalid order item id" });
      return;
    }

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
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
        status: status as OrderStatus,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });
    res.status(200).json({ order: updatedOrderItem });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_UPDATING_ORDER_STATUS", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export {
  placeOrder,
  verifyPayment,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
};
