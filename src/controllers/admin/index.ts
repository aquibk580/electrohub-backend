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
