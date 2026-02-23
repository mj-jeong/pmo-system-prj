-- Phase 1: PMO SaaS Core 강화 (FIXED)
-- Organization 설정, ProjectStatus 표준화, ProjectStatusHistory, AuditLog
--
-- 수정 이력:
--   원본 SQL은 명시적 BEGIN/COMMIT이 Prisma 트랜잭션과 충돌 → 실패
--   이 버전은 완전한 멱등성(idempotent) DDL을 사용:
--   - DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$ (type/constraint 생성)
--   - IF NOT EXISTS (table/index 생성)
--   - ALTER TYPE 없이 CREATE TYPE + CAST 방식으로 enum 교체

-- =============================================================================
-- Step 1: 새 Enum 타입 생성 (idempotent)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "WeekDay" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Step 2: ProjectStatus 마이그레이션
-- ALTER TYPE ADD VALUE 없이 CREATE TYPE + CAST 방식 사용 (트랜잭션 안전)
-- 이미 PLANNED가 존재하면 스킵 (멱등)
-- =============================================================================

DO $$
BEGIN
  -- 이미 새 enum으로 교체된 경우 스킵
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ProjectStatus' AND e.enumlabel = 'PLANNED'
  ) THEN
    -- 이전 실패 흔적 제거
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus_old') THEN
      DROP TYPE "ProjectStatus_old";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus_new') THEN
      DROP TYPE "ProjectStatus_new";
    END IF;

    -- 새 enum 생성 (PLANNED, BLOCKED 포함, DELAYED 제외)
    CREATE TYPE "ProjectStatus_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');

    -- 컬럼 기본값 제거 후 타입 교체 (DELAYED → BLOCKED 변환 포함)
    ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
    EXECUTE '
      ALTER TABLE "projects"
        ALTER COLUMN "status" TYPE "ProjectStatus_new"
        USING (
          CASE "status"::text
            WHEN ''DELAYED'' THEN ''BLOCKED''
            ELSE "status"::text
          END
        )::"ProjectStatus_new"
    ';

    -- enum 이름 교체
    ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
    ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
    DROP TYPE "ProjectStatus_old";

    -- 기본값 복원
    ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
  END IF;
END $$;

-- =============================================================================
-- Step 3: Organization 설정 필드 추가 (IF NOT EXISTS - 안전)
-- =============================================================================

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "workingHoursStart" INTEGER,
  ADD COLUMN IF NOT EXISTS "workingHoursEnd" INTEGER,
  ADD COLUMN IF NOT EXISTS "weeklyReportDay" "WeekDay";

-- =============================================================================
-- Step 4: ProjectStatusHistory 테이블 생성 (IF NOT EXISTS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "project_status_histories" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "fromStatus" "ProjectStatus",
  "toStatus" "ProjectStatus" NOT NULL,
  "changedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "project_status_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "project_status_histories_organizationId_projectId_idx"
  ON "project_status_histories"("organizationId", "projectId");

CREATE INDEX IF NOT EXISTS "project_status_histories_projectId_createdAt_idx"
  ON "project_status_histories"("projectId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "project_status_histories"
    ADD CONSTRAINT "project_status_histories_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "project_status_histories"
    ADD CONSTRAINT "project_status_histories_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "project_status_histories"
    ADD CONSTRAINT "project_status_histories_changedById_fkey"
      FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Step 5: AuditLog 테이블 생성 (IF NOT EXISTS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "audit_logs" (
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

CREATE INDEX IF NOT EXISTS "audit_logs_organizationId_createdAt_idx"
  ON "audit_logs"("organizationId", "createdAt");

CREATE INDEX IF NOT EXISTS "audit_logs_organizationId_action_idx"
  ON "audit_logs"("organizationId", "action");

CREATE INDEX IF NOT EXISTS "audit_logs_entityType_entityId_idx"
  ON "audit_logs"("entityType", "entityId");

DO $$ BEGIN
  ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
