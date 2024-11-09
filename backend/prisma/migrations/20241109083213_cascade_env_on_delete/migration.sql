-- DropForeignKey
ALTER TABLE "env_secrets" DROP CONSTRAINT "env_secrets_projectId_fkey";

-- AddForeignKey
ALTER TABLE "env_secrets" ADD CONSTRAINT "env_secrets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
