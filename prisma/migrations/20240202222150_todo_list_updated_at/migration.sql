/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TodoList" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
