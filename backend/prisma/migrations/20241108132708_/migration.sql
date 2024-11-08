/*
  Warnings:

  - A unique constraint covering the columns `[ghId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ghId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `ghUsername` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ghId" INTEGER NOT NULL,
ALTER COLUMN "ghUsername" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_ghId_key" ON "users"("ghId");
