/*
  Warnings:

  - You are about to drop the column `offerPercentage` on the `Product` table. All the data in the column will be lost.
  - Added the required column `categoryName` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "offerPercentage",
ADD COLUMN     "categoryName" TEXT NOT NULL;
