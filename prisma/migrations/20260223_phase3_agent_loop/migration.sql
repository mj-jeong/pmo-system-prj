-- Phase 3: Agent Loop 확장
-- 1. AgentStepName enum에 REVIEW, ACTION 추가
-- 2. AgentRun에 retryCount, parentRunId 추가
-- NOTE: ALTER TYPE ADD VALUE must run outside a transaction (Postgres constraint)

ALTER TYPE "AgentStepName" ADD VALUE IF NOT EXISTS 'REVIEW';
ALTER TYPE "AgentStepName" ADD VALUE IF NOT EXISTS 'ACTION';

-- AgentRun retry 필드 추가
ALTER TABLE "agent_runs"
  ADD COLUMN IF NOT EXISTS "retryCount"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "parentRunId" TEXT;

-- Index for retry chain lookup
CREATE INDEX IF NOT EXISTS "agent_runs_parentRunId_idx" ON "agent_runs"("parentRunId");
