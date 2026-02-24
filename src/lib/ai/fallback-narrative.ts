// PMO System - Fallback Narrative Generator
// Generates a structured, template-based PMO report when the LLM API is unavailable.
// Produces readable output using raw data from ReportContext without any AI call.
// All output sections include a prominent fallback warning banner.

import type { ReportContext } from "@/lib/ai/prompts";
import type { NarrativeResult } from "@/lib/llm/provider";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a template-based fallback narrative when the LLM API has failed.
 *
 * The output is readable and structured but does not use AI narrative generation.
 * All sections include a prominent warning that the report was generated in fallback mode.
 *
 * @param context - The report context collected by the agent pipeline
 * @param fallbackReason - The LLM error message that triggered the fallback
 * @returns NarrativeResult with isFallback=true and zero-cost usage
 */
export function generateFallbackNarrative(
  context: ReportContext,
  fallbackReason: string
): NarrativeResult {
  const {
    projects,
    updates,
    attendance,
    timeOff,
    analysis,
    periodStart,
    periodEnd,
    organizationName,
  } = context;

  // --- Aggregate core metrics ---
  const totalProjects = projects.length;
  const blockedCount = projects.filter((p) => p.status === "BLOCKED").length;
  const inProgressCount = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;
  const plannedCount = projects.filter((p) => p.status === "PLANNED").length;

  const avgProgress =
    totalProjects > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;

  const avgAttendance =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, a) => sum + a.rate, 0) / attendance.length)
      : 0;

  const approvedLeaves = timeOff.filter((t) => t.status === "APPROVED").length;
  const pendingLeaves = timeOff.filter((t) => t.status === "PENDING").length;

  const blockedProjectNames = analysis.delayedProjects.map((d) => d.projectName);
  const gapProjectNames = analysis.updateGaps.map((g) => g.projectName);
  const updateCount = updates.length;

  // --- Fallback warning banner ---
  const fallbackBanner = `> ⚠️ **이 리포트는 AI 서비스 장애로 인해 템플릿 기반으로 생성되었습니다.**
> AI 내러티브 생성에 실패하여 수집된 데이터를 직접 가공하여 리포트를 작성하였습니다.
> 정상 운영 시에는 AI가 상세한 분석과 인사이트를 제공합니다.
> 오류 사유: \`${fallbackReason}\``;

  // --- Executive Summary ---
  const executiveSummary = `${fallbackBanner}

**${periodStart}** ~ **${periodEnd}** 기간의 **${organizationName}** 주간 리포트입니다.

**포트폴리오 현황**: 총 ${totalProjects}개 프로젝트 — 진행중 ${inProgressCount}개, 차단됨 ${blockedCount}개, 완료 ${completedCount}개, 계획됨 ${plannedCount}개. 평균 진척률 ${avgProgress}%.

**인력 현황**: 기간 내 평균 출근율 ${avgAttendance}%. 승인된 휴가 ${approvedLeaves}건, 검토 대기 중 ${pendingLeaves}건.

${
  blockedCount > 0
    ? `**주요 리스크**: ${blockedCount}개 프로젝트가 BLOCKED 상태입니다 — ${blockedProjectNames.join(", ")}.`
    : "**주요 리스크**: 현재 BLOCKED 상태의 프로젝트가 없습니다."
}

${
  gapProjectNames.length > 0
    ? `**업데이트 공백**: ${gapProjectNames.length}개 프로젝트에서 이번 기간 업데이트가 없습니다 — ${gapProjectNames.join(", ")}.`
    : ""
}`.trim();

  // --- Project Narrative ---
  const projectSections = projects.map((p) => {
    const projectUpdates = updates.filter((u) => u.projectName === p.name);
    const isBlocked = p.status === "BLOCKED";
    const hasGap = analysis.updateGaps.some((g) => g.projectName === p.name);

    return `### ${p.name}
- **상태**: ${p.status} | **진척률**: ${p.progress}%
- **기간**: ${p.startDate ?? "미정"} ~ ${p.endDate ?? "미정"}
- **이번 기간 업데이트**: ${projectUpdates.length}건
${isBlocked ? "- **리스크**: 프로젝트가 BLOCKED 상태입니다. 즉각적인 확인이 필요합니다." : ""}
${hasGap ? "- **경고**: 이번 기간에 업데이트가 기록되지 않았습니다." : ""}`.trim();
  });

  const projectNarrative = `${fallbackBanner}

## 프로젝트 현황

${projectSections.join("\n\n")}`;

  // --- Workforce Narrative ---
  const anomalyDetails =
    analysis.attendanceAnomalies.length > 0
      ? analysis.attendanceAnomalies.map((a) => `${a.date} (${a.rate}%)`).join(", ")
      : "없음";

  const workforceNarrative = `${fallbackBanner}

## 인력 및 출근 현황

- **평균 출근율**: ${avgAttendance}%
- **출근 데이터**: ${attendance.length}일간 집계
- **출근율 이상 감지** (70% 미만): ${analysis.attendanceAnomalies.length}일 — ${anomalyDetails}
- **승인된 휴가**: ${approvedLeaves}건
- **승인 대기 휴가**: ${pendingLeaves}건

${
  analysis.workforceImpact.concentrationWarning
    ? "**주의**: 특정 기간에 휴가가 집중되어 팀 업무 가용성에 영향을 줄 수 있습니다."
    : "휴가 집중 경고 없음."
}`;

  // --- Progress Snapshot Table ---
  const progressTableRows = projects
    .map(
      (p) =>
        `| ${p.name} | ${p.status} | ${p.progress}% | ${p.startDate ?? "미정"} | ${p.endDate ?? "미정"} |`
    )
    .join("\n");

  // --- Full Markdown ---
  const markdown = `# PMO 주간 리포트: ${periodStart} ~ ${periodEnd}

${fallbackBanner}

---

## Executive Summary

${executiveSummary}

---

## Project Highlights

${projectSections.join("\n\n")}

---

## Risks & Blockers

${
  blockedCount > 0
    ? `### 차단된 프로젝트\n${blockedProjectNames.map((n) => `- [ ] 검토 및 차단 해제 필요: **${n}**`).join("\n")}`
    : "현재 BLOCKED 상태의 프로젝트가 없습니다."
}

${
  gapProjectNames.length > 0
    ? `### 업데이트 공백\n${gapProjectNames.map((n) => `- [ ] 상태 업데이트 요청 필요: **${n}**`).join("\n")}`
    : "업데이트 공백 없음."
}

${
  analysis.attendanceAnomalies.length > 0
    ? `### 출근 이슈\n- [ ] 출근율 미달 날짜 확인: ${analysis.attendanceAnomalies.map((a) => a.date).join(", ")}`
    : "출근 이슈 없음."
}

---

## Progress Snapshot

| 프로젝트 | 상태 | 진척률 | 시작일 | 종료일 |
|---------|------|--------|--------|--------|
${progressTableRows}

---

## Workforce & Availability

${workforceNarrative}

---

## Next Week Plan

- [ ] BLOCKED 프로젝트 검토 및 장애 요인 해소
- [ ] 업데이트 공백 프로젝트 담당자에게 현황 업데이트 요청
- [ ] 출근율 이슈 발생 날짜 원인 파악
- [ ] 대기 중인 휴가 신청 검토

---

## Appendix: Data Sources

- **프로젝트**: ${totalProjects}개
- **프로젝트 업데이트**: ${updateCount}건
- **출근 데이터**: ${attendance.length}일
- **휴가 신청**: ${timeOff.length}건
- **분석 엔진**: 결정론적 분석 (v1.0)
- **LLM 제공자**: FallbackNarrativeGenerator (템플릿 기반)

---
*폴백 모드로 생성된 리포트. 총 프로젝트: ${totalProjects}개 | 기간: ${periodStart} ~ ${periodEnd}*`;

  return {
    executiveSummary,
    projectNarrative,
    workforceNarrative,
    markdown,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: "fallback",
    },
    isFallback: true,
    fallbackReason,
  };
}
