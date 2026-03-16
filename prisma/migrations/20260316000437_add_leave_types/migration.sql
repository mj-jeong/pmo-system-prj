/*
  Warnings:

  - The values [PERSONAL] on the enum `TimeOffType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TimeOffType_new" AS ENUM ('VACATION', 'HALF_DAY', 'QUARTER_DAY', 'SICK', 'SPECIAL', 'CONDOLENCE', 'HEALTH', 'UNPAID', 'PAID');
ALTER TABLE "time_offs" ALTER COLUMN "type" TYPE "TimeOffType_new" USING ("type"::text::"TimeOffType_new");
ALTER TYPE "TimeOffType" RENAME TO "TimeOffType_old";
ALTER TYPE "TimeOffType_new" RENAME TO "TimeOffType";
DROP TYPE "TimeOffType_old";
COMMIT;

-- DropIndex
DROP INDEX "agent_runs_parentRunId_idx";
