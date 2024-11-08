/*
  Warnings:

  - A unique constraint covering the columns `[webhookId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "webhookId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_webhookId_key" ON "projects"("webhookId");
