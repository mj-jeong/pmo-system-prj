-- Phase 1: PMO SaaS Core 강화
-- Organization 설정, ProjectStatus 표준화, ProjectStatusHistory, AuditLog

-- =============================================================================
-- Step 1: 새 Enum 타입 생성
-- =============================================================================

CREATE TYPE "WeekDay" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

CREATE TYPE "AuditAction" AS ENUM (
  'PROJECT_CREATED',
  'PROJECT_UPDATED',
  'PROJECT_DELETED',
  'PROJECT_STATUS_CHANGED',
  'REPORT_GENERATED',
  'REPORT_PUBLISHED',
  'MEMBER_INVITED',
  'MEMBER_APPROVED',
  'MEMBER_REJECTED',
  'MEMBER_REMOVED',
  'TIME_OFF_APPROVED',
  'TIME_OFF_REJECTED',
  'ORG_SETTINGS_UPDATED'
);

-- =============================================================================
-- Step 2: ProjectStatus 마이그레이션
-- 순서: 신규 값 추가 → 데이터 전환 → enum 재정의 (DELAYED 제거)
-- =============================================================================

-- 2-1: 신규 값을 기존 enum에 추가 (ALTER TYPE ADD VALUE는 트랜잭션 밖에서 실행)
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'PLANNED';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'BLOCKED';

-- 2-2: 데이터 마이그레이션 (BLOCKED가 enum에 추가된 후에 실행)
UPDATE "projects" SET "status" = 'BLOCKED' WHERE "status" = 'DELAYED';

-- 2-3: 깔끔한 enum으로 교체 (DELAYED 제거)
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "ProjectStatus_old";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- =============================================================================
-- Step 3: Organization 설정 필드 추가
-- =============================================================================

ALTER TABLE "organizations"
  ADD COLUMN "workingHoursStart" INTEGER,
  ADD COLUMN "workingHoursEnd" INTEGER,
  ADD COLUMN "weeklyReportDay" "WeekDay";

-- =============================================================================
-- Step 4: ProjectStatusHistory 테이블 생성
-- =============================================================================

CREATE TABLE "project_status_histories" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "fromStatus" "ProjectStatus",
  "toStatus" "ProjectStatus" NOT NULL,
  "changedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "project_status_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_status_histories_organizationId_projectId_idx"
  ON "project_status_histories"("organizationId", "projectId");

CREATE INDEX "project_status_histories_projectId_createdAt_idx"
  ON "project_status_histories"("projectId", "createdAt");

ALTER TABLE "project_status_histories"
  ADD CONSTRAINT "project_status_histories_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_status_histories"
  ADD CONSTRAINT "project_status_histories_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "project_status_histories"
  ADD CONSTRAINT "project_status_histories_changedById_fkey"
    FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- Step 5: AuditLog 테이블 생성
-- =============================================================================

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_organizationId_createdAt_idx"
  ON "audit_logs"("organizationId", "createdAt");

CREATE INDEX "audit_logs_organizationId_action_idx"
  ON "audit_logs"("organizationId", "action");

CREATE INDEX "audit_logs_entityType_entityId_idx"
  ON "audit_logs"("entityType", "entityId");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
