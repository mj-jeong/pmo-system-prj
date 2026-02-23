-- Phase 2: Weekly Report Agent 고도화
-- Report 모델에 reasoningTrace, comparisonData 컬럼 추가

ALTER TABLE "reports"
  ADD COLUMN IF NOT EXISTS "reasoningTrace" JSONB,
  ADD COLUMN IF NOT EXISTS "comparisonData" JSONB;
