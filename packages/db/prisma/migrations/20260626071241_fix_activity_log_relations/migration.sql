/*
  Warnings:

  - You are about to drop the column `entity` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_actionId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_auditId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_findingId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_riskId_fkey";

-- DropIndex
DROP INDEX "ActivityLog_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityLog_entityId_idx";

-- DropIndex
DROP INDEX "ActivityLog_entity_idx";

-- DropIndex
DROP INDEX "ActivityLog_orgId_idx";

-- DropIndex
DROP INDEX "ActivityLog_userId_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "entity",
DROP COLUMN "entityId",
DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
ADD COLUMN     "actionId" TEXT,
ADD COLUMN     "auditId" TEXT,
ADD COLUMN     "findingId" TEXT,
ADD COLUMN     "riskId" TEXT;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "CorrectiveAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
