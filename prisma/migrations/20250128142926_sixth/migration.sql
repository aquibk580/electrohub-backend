/*
  Warnings:

  - A unique constraint covering the columns `[productInfoId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productInfoId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productInfoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProductInfo" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "color" TEXT,
    "warranty" TEXT,
    "buildMaterial" TEXT,

    CONSTRAINT "ProductInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productInfoId_key" ON "Product"("productInfoId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productInfoId_fkey" FOREIGN KEY ("productInfoId") REFERENCES "ProductInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
