/*
  Warnings:

  - You are about to drop the column `offerPrice` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryName_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "offerPrice",
ADD COLUMN     "offerPercentage" TEXT,
ALTER COLUMN "price" SET DATA TYPE TEXT,
ALTER COLUMN "stock" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
