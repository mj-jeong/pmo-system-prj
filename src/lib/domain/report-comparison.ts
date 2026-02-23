// PMO System - Report Comparison
// 이전 주간 리포트 대비 현재 분석 결과의 델타(차이)를 계산합니다.
// CRITICAL: ZERO AI/OpenAI imports. Pure deterministic computation.

import type { AnalysisResult } from "./agent-analysis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComparisonDeltas {
  projectCount: number;    // 이번 주 프로젝트 수 - 이전 주
  blockedCount: number;    // BLOCKED 프로젝트 수 변화
  avgProgress: number;     // 평균 진척도 변화 (소수점 1자리)
  riskScore: number;       // 종합 리스크 스코어 변화
}

export interface ComparisonData {
  previousReportId: string;
  previousPeriod: { start: string; end: string };
  deltas: ComparisonDeltas;
}

// ---------------------------------------------------------------------------
// 이전 리포트 structuredData 에서 추출한 요약 형태
// ---------------------------------------------------------------------------

interface PreviousReportSummary {
  projectCount?: number;
  blockedCount?: number;
  avgProgress?: number;
  riskScore?: number;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * 현재 분석 결과와 이전 리포트의 structuredData를 비교하여 ComparisonData를 반환합니다.
 *
 * @param currentAnalysis - 이번 ANALYZE 단계 결과
 * @param currentProjectCount - 이번 리포트 대상 프로젝트 수
 * @param previousReport - DB에서 조회한 이전 PUBLISHED 리포트 레코드
 */
export function computeComparison(
  currentAnalysis: AnalysisResult,
  currentProjectCount: number,
  previousReport: {
    id: string;
    periodStart: Date;
    periodEnd: Date;
    structuredData: unknown;
    reasoningTrace: unknown;
  }
): ComparisonData {
  // 현재 값 계산
  const currentBlocked = currentAnalysis.delayedProjects.filter(
    (p) => p.reason === "STATUS_BLOCKED"
  ).length;
  const currentRiskScore = currentAnalysis.riskScore;

  // 이전 리포트에서 요약 추출
  const prev = extractPreviousSummary(previousReport.structuredData, previousReport.reasoningTrace);

  const prevProjectCount = prev.projectCount ?? currentProjectCount;
  const prevBlocked = prev.blockedCount ?? currentBlocked;
  const prevRiskScore = prev.riskScore ?? currentRiskScore;

  // avgProgress 계산 — structuredData에 저장된 analysis.delayedProjects 에서 역산
  const currentAvgProgress = computeAvgProgress(currentAnalysis);
  const prevAvgProgress = prev.avgProgress ?? currentAvgProgress;

  return {
    previousReportId: previousReport.id,
    previousPeriod: {
      start: previousReport.periodStart.toISOString(),
      end: previousReport.periodEnd.toISOString(),
    },
    deltas: {
      projectCount: currentProjectCount - prevProjectCount,
      blockedCount: currentBlocked - prevBlocked,
      avgProgress: parseFloat((currentAvgProgress - prevAvgProgress).toFixed(1)),
      riskScore: currentRiskScore - prevRiskScore,
    },
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function extractPreviousSummary(
  structuredData: unknown,
  reasoningTrace: unknown
): PreviousReportSummary {
  const result: PreviousReportSummary = {};

  // reasoningTrace에서 riskScore 추출
  if (reasoningTrace && typeof reasoningTrace === "object") {
    const trace = reasoningTrace as Record<string, unknown>;
    if (typeof trace.riskScore === "number") {
      result.riskScore = trace.riskScore;
    }
    if (trace.inputSummary && typeof trace.inputSummary === "object") {
      const summary = trace.inputSummary as Record<string, unknown>;
      if (typeof summary.projectCount === "number") {
        result.projectCount = summary.projectCount;
      }
    }
  }

  // structuredData에서 analysis 추출
  if (structuredData && typeof structuredData === "object") {
    const data = structuredData as Record<string, unknown>;
    if (data.analysis && typeof data.analysis === "object") {
      const analysis = data.analysis as Record<string, unknown>;

      // blockedCount
      if (Array.isArray(analysis.delayedProjects)) {
        result.blockedCount = (analysis.delayedProjects as Array<{ reason?: string }>).filter(
          (p) => p.reason === "STATUS_BLOCKED"
        ).length;
      }

      // avgProgress via delayedProjects (best effort)
      if (result.avgProgress === undefined && Array.isArray(analysis.delayedProjects)) {
        // structuredData에 avgProgress가 없으면 0으로 폴백
        result.avgProgress = 0;
      }
    }
  }

  return result;
}

function computeAvgProgress(analysis: AnalysisResult): number {
  // AnalysisResult에는 개별 프로젝트 progress가 delayedProjects를 통해서만 접근 가능.
  // delayedProjects의 평균을 근사치로 사용 (0인 경우 0 반환)
  if (analysis.delayedProjects.length === 0) return 0;
  const sum = analysis.delayedProjects.reduce((acc, p) => acc + p.progress, 0);
  return parseFloat((sum / analysis.delayedProjects.length).toFixed(1));
}
