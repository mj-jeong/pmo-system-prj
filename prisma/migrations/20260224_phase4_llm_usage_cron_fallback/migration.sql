-- Phase 4: 자동화 & 운영 관점 확장
-- 1. Report 모델에 isFallback, fallbackReason 추가
-- 2. LlmUsage 모델 추가
-- 3. AgentRun에 llmUsages relation (FK만, 별도 컬럼 없음)
-- 4. Organization에 llmUsages relation (FK만, 별도 컬럼 없음)

-- Report: Fallback 필드 추가
ALTER TABLE "reports"
  ADD COLUMN IF NOT EXISTS "isFallback"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "fallbackReason" TEXT;

-- LlmUsage 테이블 생성
CREATE TABLE IF NOT EXISTS "llm_usages" (
  "id"               TEXT NOT NULL,
  "organizationId"   TEXT NOT NULL,
  "agentRunId"       TEXT NOT NULL,
  "model"            TEXT NOT NULL,
  "promptTokens"     INTEGER NOT NULL,
  "completionTokens" INTEGER NOT NULL,
  "totalTokens"      INTEGER NOT NULL,
  "estimatedCostUsd" DOUBLE PRECISION,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "llm_usages_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "llm_usages"
  ADD CONSTRAINT "llm_usages_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "llm_usages"
  ADD CONSTRAINT "llm_usages_agentRunId_fkey"
    FOREIGN KEY ("agentRunId") REFERENCES "agent_runs"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "llm_usages_organizationId_createdAt_idx" ON "llm_usages"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "llm_usages_agentRunId_idx" ON "llm_usages"("agentRunId");
