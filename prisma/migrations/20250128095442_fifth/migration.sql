/*
  Warnings:

  - Added the required column `answer` to the `Seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "answer" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "answer" TEXT NOT NULL;
