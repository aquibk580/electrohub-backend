import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { startOfMonth, endOfMonth, subDays, startOfDay } from "date-fns";

export async function getSalesStatistics(req: Request, res: Response) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const orders = await db.orderItem.count({});
    const users = await db.user.count({});
    const sellers = await db.seller.count({});
    const monthlyOrders = await db.orderItem.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
    const products = await db.product.findMany({
      include: {
        orderItems: true,
      },
    });

    if (products.length === 0) {
      res.status(200).json({ message: "No products available" });
      return;
    }
    const sales = products.reduce(
      (acc, product) =>
        acc +
        product.orderItems.length *
          product.price *
          (1 - (product.offerPercentage ? product.offerPercentage / 100 : 0)),
      0
    );

    const last7DaysSales = await Promise.all(
      [...Array(7)].map(async (_, i) => {
        const day = subDays(currentDate, i);
        const startOfDayDate = startOfDay(day);

        const orders = await db.orderItem.findMany({
          where: {
            createdAt: {
              gte: startOfDayDate,
              lt: subDays(startOfDayDate, -1),
            },
          },
          include: {
            product: true,
          },
        });

        const totalSales = orders.reduce(
          (acc, order) => {
            if (!order.product) return 0;
            return (
              acc +
              order?.product.price *
                (1 -
                  (order!.product.offerPercentage
                    ? order!.product.offerPercentage / 100
                    : 0))
            );
          },

          0
        );

        return {
          date: day,
          sales: totalSales,
        };
      })
    );

    const weeklySales = last7DaysSales.reverse();

    res
      .status(200)
      .json({ sales, users, sellers, orders, monthlyOrders, weeklySales });
    return;
  } catch (error: any) {
    console.log("ERROR_WHILE_GETTING_SALES_DATA");
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
    return;
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
