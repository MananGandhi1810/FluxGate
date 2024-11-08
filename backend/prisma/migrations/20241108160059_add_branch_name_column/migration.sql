/*
  Warnings:

  - The values [NODE,REACT,DJANGO,FLASK,EXPRESS,NEXT,PYTHON,OTHER] on the enum `ProjectFramework` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectFramework_new" AS ENUM ('Node', 'React', 'Express', 'Next', 'Flask', 'Django', 'Other');
ALTER TABLE "projects" ALTER COLUMN "framework" TYPE "ProjectFramework_new" USING ("framework"::text::"ProjectFramework_new");
ALTER TYPE "ProjectFramework" RENAME TO "ProjectFramework_old";
ALTER TYPE "ProjectFramework_new" RENAME TO "ProjectFramework";
DROP TYPE "ProjectFramework_old";
COMMIT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "branchName" TEXT DEFAULT 'main';
