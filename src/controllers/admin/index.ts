import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { startOfMonth, endOfMonth, startOfDay, subDays } from "date-fns";

type OrderItemWithProduct = {
  id: string;
  price: number;
  offerPercentage: number | null;
};

export async function getSalesStatistics(req: Request, res: Response) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    // Basic counts in parallel
    const [orders, users, sellers, monthlyOrders] = await Promise.all([
      db.orderItem.count(),
      db.user.count(),
      db.seller.count(),
      db.orderItem.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
    ]);

    // Heavy query: Fetch only needed fields from orderItems with timeout
    const allOrderItems = await db.$queryRawUnsafe<OrderItemWithProduct[]>(`
      SELECT oi."id", p."price", p."offerPercentage"
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
    `);

    const sales = allOrderItems.reduce((acc: number, item: any) => {
      const price = item.price;
      const discount = item.offerPercentage || 0;
      const finalPrice = price * (1 - discount / 100);
      return acc + finalPrice;
    }, 0);

    // Weekly Sales: Query one day at a time, sequentially to avoid overload
    const last7DaysSales: { date: Date; sales: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = subDays(currentDate, i);
      const start = startOfDay(day);
      const end = subDays(start, -1);

      const dayOrders = await db.orderItem.findMany({
        where: {
          createdAt: {
            gte: start,
            lt: end,
          },
        },
        select: {
          product: {
            select: {
              price: true,
              offerPercentage: true,
            },
          },
        },
      });

      const totalSales = dayOrders.reduce((acc, item) => {
        if (!item.product) return acc;
        const price = item.product.price;
        const discount = item.product.offerPercentage || 0;
        return acc + price * (1 - discount / 100);
      }, 0);

      last7DaysSales.push({ date: start, sales: totalSales });
    }

    res.status(200).json({
      sales,
      users,
      sellers,
      orders,
      monthlyOrders,
      weeklySales: last7DaysSales,
    });
  } catch (error: any) {
    console.error("ERROR_WHILE_GETTING_SALES_DATA", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
}

export async function getOrdersData(req: Request, res: Response) {
  try {
    const orderItems = await db.orderItem.findMany({
      include: {
        order: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    if (orderItems.length === 0) {
      res.status(404).json({ error: "No Orders available" });
      return;
    }

    const orders = await db.order.count({});
    const returns = await db.orderItem.count({
      where: {
        status: "Returned",
      },
    });
    const fulfilledOrders = await db.orderItem.count({
      where: {
        status: "Delivered",
      },
    });

    // Transform orderItems to include customer name
    const formattedOrderItems = orderItems.map((orderItem) => ({
      ...orderItem,
      customerName: orderItem.order?.user?.name || "Unknown", // Fallback if no user is associated
    }));

    res.status(200).json({
      orderItems: formattedOrderItems,
      orders,
      returns,
      fulfilledOrders,
    });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ORDERS_DATA");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export async function getSingleOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id, 10);

    const orderItem = await db.orderItem.findUnique({
      where: {
        id: orderId,
      },
      include: {
        order: {
          select: {
            user: true,
          },
        },
        product: {
          include: {
            images: true,
            seller: true, // Fetch seller details
          },
        },
      },
    });

    if (!orderItem) {
      res.status(404).json({ error: "OrderItem not found" });
      return;
    }

    const sellerId = orderItem.product?.seller?.id;
    let averageRating: number | null = null;
    let totalOrders: number | null = null;

    if (sellerId) {
      const sellerReviewData = await db.review.aggregate({
        where: {
          product: {
            sellerId: sellerId, // Filter reviews for products of this seller
          },
        },
        _avg: {
          rating: true, // Compute the average rating
        },
      });

      averageRating = sellerReviewData._avg.rating || 0; // Default to 0 if no reviews exist

      const totalSellerOrders = await db.orderItem.count({
        where: {
          product: {
            sellerId,
          },
        },
      });

      totalOrders = totalSellerOrders;
    }

    const formattedOrderItem = {
      ...orderItem,
      user: orderItem.order?.user,
      sellerAverageRating: averageRating,
      totalSellerOrders: totalOrders,
    };

    res.status(200).json(formattedOrderItem);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_SINGLE_ORDER", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}

export async function getAllAdmins(req: Request, res: Response) {
  try {
    const admins = await db.admin.findMany({});

    if (admins.length === 0) {
      res.status(404).json({ message: "No Admin found" });
      return;
    }

    res.status(200).json(admins);
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_ALL_ADMINS");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
  }
}
