/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `BannerCarousel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BannerCarousel" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductCarousel" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_productId_key" ON "CartItem"("productId");
