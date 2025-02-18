/*
  Warnings:

  - The `offerPercentage` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `price` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stock` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `imageUrl` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GenderOptions" AS ENUM ('Male', 'Female', 'Other');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
ADD COLUMN     "price" INTEGER NOT NULL,
DROP COLUMN "stock",
ADD COLUMN     "stock" INTEGER NOT NULL,
DROP COLUMN "offerPercentage",
ADD COLUMN     "offerPercentage" INTEGER;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "GenderOptions";
