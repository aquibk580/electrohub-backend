/*
  Warnings:

  - The values [Pending] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `imageUrl` on the `Review` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('OrderConfirmed', 'Shipped', 'Delivered', 'Canceled', 'Returned');
ALTER TABLE "OrderItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OrderItem" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "OrderItem" ALTER COLUMN "status" SET DEFAULT 'OrderConfirmed';
COMMIT;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "status" SET DEFAULT 'OrderConfirmed';

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "imageUrl";
