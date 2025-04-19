// scripts/prefillSellerId.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function prefillSellerIds() {
  try {
    // Get all orderItems where sellerId is null but productId is set
    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId: null,
        NOT: { productId: null },
      },
      include: {
        product: {
          select: { sellerId: true },
        },
      },
    });

    console.log(`Found ${orderItems.length} orderItems to update...`);

    for (const item of orderItems) {
      if (item.product?.sellerId) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            sellerId: item.product.sellerId,
          },
        });
      }
    }

    console.log("✅ SellerIds backfilled successfully.");
  } catch (err) {
    console.error("❌ Error during backfill:", err);
  } finally {
    await prisma.$disconnect();
  }
}

prefillSellerIds();
