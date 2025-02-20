import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { UserPayload } from "../../types/Payload";

async function getAllOrders(req: Request, res: Response) {
  try {
    const sellerId = parseInt((req.user as UserPayload).id, 10);

    // if (isNaN(sellerId)) {
    //   res.status(400).json({ error: "Invalid or missing seller id" });
    //   return;
    // }
    console.log(sellerId);

    const products = await db.product.findMany({
      where: {
        sellerId,
      },
      include: {
        orderItems: true,
      },
    });

    const orderIds = products.flatMap((p) =>
      p.orderItems.map((orderItem) => orderItem.orderId)
    );

    if (orderIds.length === 0) {
      return res.status(200).json({ orders: [] });
    }

    const orders = await db.order.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      include: {
        orderItems: {
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

    res.status(200).json(orders);
    return;
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.messgae });
    return;
  }
}

export { getAllOrders };
