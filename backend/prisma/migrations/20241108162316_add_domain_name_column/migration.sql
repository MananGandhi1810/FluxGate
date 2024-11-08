/*
  Warnings:

  - A unique constraint covering the columns `[domainName]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ProjectFramework" ADD VALUE 'Docker';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "domainName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_domainName_key" ON "projects"("domainName");
