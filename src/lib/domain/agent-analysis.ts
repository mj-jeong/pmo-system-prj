// PMO System - Agent Deterministic Analysis
// Pure computation functions for analyzing collected PMO data.
// CRITICAL: ZERO AI/OpenAI imports or calls. All logic is deterministic.
// Each function receives raw data and returns structured analysis results.

import type {
  ProjectSnapshot,
  ProjectUpdateRecord,
  AttendanceDaySummary,
  TimeOffSummaryRecord,
} from "./agent-tools";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DelayedProject {
  projectId: string;
  projectName: string;
  status: string;
  progress: number;
  expectedProgress: number | null;
  reason: "STATUS_BLOCKED" | "BEHIND_SCHEDULE";
}

export interface UpdateGap {
  projectId: string;
  projectName: string;
  lastUpdateAt: Date | null;
  daysSinceUpdate: number | null;
  hasNoUpdates: boolean;
}

export interface AttendanceAnomaly {
  date: Date;
  rate: number;
  present: number;
  totalMembers: number;
  severity: "WARNING" | "CRITICAL";
}

export interface WorkforceImpact {
  totalLeaveRequests: number;
  totalLeaveDays: number;
  approvedLeaveDays: number;
  pendingLeaveDays: number;
  peakLeaveDates: Array<{ date: string; count: number }>;
  leaveByType: Record<string, number>;
  concentrationWarning: boolean;
}

// ---------------------------------------------------------------------------
// Rule-based Analysis Types (Phase 2)
// ---------------------------------------------------------------------------

export type RuleSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface RuleResult {
  ruleId: string;
  name: string;
  triggered: boolean;
  severity: RuleSeverity;
  score: number;          // 0-100
  reason: string;
  affectedItems: string[]; // 영향받은 프로젝트 ID 목록
}

export interface AnalysisResult {
  delayedProjects: DelayedProject[];
  updateGaps: UpdateGap[];
  attendanceAnomalies: AttendanceAnomaly[];
  workforceImpact: WorkforceImpact;
  ruleResults: RuleResult[];
  riskScore: number;      // 0-100 종합 리스크 점수
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Analysis Functions
// ---------------------------------------------------------------------------

/**
 * Detect projects that are delayed or behind schedule.
 *
 * Rules:
 * - STATUS_BLOCKED: project.status === "BLOCKED"
 * - BEHIND_SCHEDULE: progress < expected progress based on elapsed timeline
 */
export function detectDelayedProjects(projects: ProjectSnapshot[]): DelayedProject[] {
  const results: DelayedProject[] = [];
  const now = new Date();

  for (const project of projects) {
    // Rule 1: Explicit BLOCKED status
    if (project.status === "BLOCKED") {
      results.push({
        projectId: project.id,
        projectName: project.name,
        status: project.status,
        progress: project.progress,
        expectedProgress: null,
        reason: "STATUS_BLOCKED",
      });
      continue;
    }

    // Rule 2: Behind schedule based on timeline
    if (project.startDate && project.endDate && project.status === "IN_PROGRESS") {
      const totalDuration = project.endDate.getTime() - project.startDate.getTime();
      const elapsed = now.getTime() - project.startDate.getTime();

      if (totalDuration > 0 && elapsed > 0) {
        const elapsedRatio = Math.min(1, elapsed / totalDuration);
        const expectedProgress = Math.round(elapsedRatio * 100);

        // Consider behind schedule if progress is more than 15 percentage points below expected
        if (project.progress < expectedProgress - 15) {
          results.push({
            projectId: project.id,
            projectName: project.name,
            status: project.status,
            progress: project.progress,
            expectedProgress,
            reason: "BEHIND_SCHEDULE",
          });
        }
      }
    }
  }

  return results;
}

/**
 * Detect projects with zero updates in the reporting period.
 *
 * Rules:
 * - Gap: zero updates from the selected project in the period
 */
export function detectUpdateGaps(
  projects: ProjectSnapshot[],
  updates: ProjectUpdateRecord[]
): UpdateGap[] {
  const results: UpdateGap[] = [];

  // Build a map of projectId -> latest update
  const updatesByProject = new Map<string, ProjectUpdateRecord[]>();
  for (const update of updates) {
    if (!updatesByProject.has(update.projectId)) {
      updatesByProject.set(update.projectId, []);
    }
    updatesByProject.get(update.projectId)!.push(update);
  }

  const now = new Date();

  for (const project of projects) {
    // Skip completed projects
    if (project.status === "COMPLETED") continue;

    const projectUpdates = updatesByProject.get(project.id);

    if (!projectUpdates || projectUpdates.length === 0) {
      results.push({
        projectId: project.id,
        projectName: project.name,
        lastUpdateAt: null,
        daysSinceUpdate: null,
        hasNoUpdates: true,
      });
    } else {
      // Find the most recent update
      const latestUpdate = projectUpdates.reduce((latest, u) =>
        u.createdAt > latest.createdAt ? u : latest
      );
      const daysSince = Math.floor(
        (now.getTime() - latestUpdate.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Flag if no updates in the period (should not happen if we have updates,
      // but we still track it for the report)
      if (projectUpdates.length === 0) {
        results.push({
          projectId: project.id,
          projectName: project.name,
          lastUpdateAt: latestUpdate.createdAt,
          daysSinceUpdate: daysSince,
          hasNoUpdates: true,
        });
      }
    }
  }

  return results;
}

/**
 * Detect days where attendance rate falls below threshold.
 *
 * Rules:
 * - WARNING: daily rate < 70%
 * - CRITICAL: daily rate < 50%
 */
export function detectAttendanceAnomalies(
  attendance: AttendanceDaySummary[]
): AttendanceAnomaly[] {
  const results: AttendanceAnomaly[] = [];

  for (const day of attendance) {
    if (day.rate < 50) {
      results.push({
        date: day.date,
        rate: day.rate,
        present: day.present,
        totalMembers: day.totalMembers,
        severity: "CRITICAL",
      });
    } else if (day.rate < 70) {
      results.push({
        date: day.date,
        rate: day.rate,
        present: day.present,
        totalMembers: day.totalMembers,
        severity: "WARNING",
      });
    }
  }

  return results;
}

/**
 * Calculate workforce impact from time-off data.
 *
 * Analyzes:
 * - Total leave requests and days
 * - Leave concentration (multiple people off same day)
 * - Leave breakdown by type
 */
export function calculateWorkforceImpact(
  timeOff: TimeOffSummaryRecord[],
  attendance: AttendanceDaySummary[]
): WorkforceImpact {
  let totalLeaveDays = 0;
  let approvedLeaveDays = 0;
  let pendingLeaveDays = 0;
  const leaveByType: Record<string, number> = {};

  // Count leave days by type and status
  for (const request of timeOff) {
    totalLeaveDays += request.days;

    if (request.status === "APPROVED") {
      approvedLeaveDays += request.days;
    } else {
      pendingLeaveDays += request.days;
    }

    leaveByType[request.type] = (leaveByType[request.type] || 0) + request.days;
  }

  // Compute leave concentration per date
  const dateCountMap = new Map<string, number>();

  for (const request of timeOff) {
    if (request.status !== "APPROVED") continue;

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split("T")[0];
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + 1);
      current.setDate(current.getDate() + 1);
    }
  }

  // Find peak leave dates (top 5 by count, minimum 2 concurrent)
  const peakLeaveDates = Array.from(dateCountMap.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([date, count]) => ({ date, count }));

  // Concentration warning: if any day has >= 30% of team on leave
  const avgTeamSize =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, d) => sum + d.totalMembers, 0) / attendance.length)
      : 0;

  const concentrationThreshold = avgTeamSize > 0 ? Math.ceil(avgTeamSize * 0.3) : 3;
  const concentrationWarning = peakLeaveDates.some((p) => p.count >= concentrationThreshold);

  return {
    totalLeaveRequests: timeOff.length,
    totalLeaveDays,
    approvedLeaveDays,
    pendingLeaveDays,
    peakLeaveDates,
    leaveByType,
    concentrationWarning,
  };
}

// ---------------------------------------------------------------------------
// Rule-based Analyzers (Phase 2)
// ---------------------------------------------------------------------------

/**
 * Rule: BLOCKED 상태 프로젝트가 전체의 20% 이상 또는 절대값 3개 이상인 경우
 * Severity: CRITICAL
 */
export function blockedProjectRiskRule(projects: ProjectSnapshot[]): RuleResult {
  const activeProjects = projects.filter((p) => p.status !== "COMPLETED");
  const blockedProjects = projects.filter((p) => p.status === "BLOCKED");
  const blockedRatio = activeProjects.length > 0 ? blockedProjects.length / activeProjects.length : 0;
  const triggered = blockedProjects.length >= 3 || blockedRatio >= 0.2;

  let score = 0;
  if (triggered) {
    // CRITICAL: 최소 60점, 비율에 따라 최대 100점
    score = Math.min(100, 60 + Math.round(blockedRatio * 100));
  } else if (blockedProjects.length > 0) {
    score = Math.round(blockedRatio * 60);
  }

  return {
    ruleId: "blocked-project-risk",
    name: "BLOCKED 프로젝트 위험",
    triggered,
    severity: "CRITICAL",
    score,
    reason: blockedProjects.length === 0
      ? "BLOCKED 프로젝트 없음"
      : `전체 ${activeProjects.length}개 프로젝트 중 ${blockedProjects.length}개가 BLOCKED 상태입니다 (${Math.round(blockedRatio * 100)}%)`,
    affectedItems: blockedProjects.map((p) => p.id),
  };
}

/**
 * Rule: 2주(14일) 이상 업데이트 없는 IN_PROGRESS 프로젝트 존재
 * Severity: WARNING
 */
export function delayDurationWarningRule(
  projects: ProjectSnapshot[],
  updates: ProjectUpdateRecord[]
): RuleResult {
  const STALE_DAYS = 14;
  const now = new Date();

  // 최신 업데이트 날짜 맵 구성
  const lastUpdateMap = new Map<string, Date>();
  for (const update of updates) {
    const existing = lastUpdateMap.get(update.projectId);
    if (!existing || update.createdAt > existing) {
      lastUpdateMap.set(update.projectId, update.createdAt);
    }
  }

  const staleProjects = projects.filter((p) => {
    if (p.status !== "IN_PROGRESS") return false;
    const lastUpdate = lastUpdateMap.get(p.id);
    if (!lastUpdate) return true; // 업데이트 자체가 없음
    const daysSince = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= STALE_DAYS;
  });

  const triggered = staleProjects.length > 0;
  const score = triggered ? Math.min(100, 30 + staleProjects.length * 15) : 0;

  return {
    ruleId: "delay-duration-warning",
    name: "장기 진척 없음 경고",
    triggered,
    severity: "WARNING",
    score,
    reason: triggered
      ? `${staleProjects.length}개 프로젝트가 ${STALE_DAYS}일 이상 업데이트 없음`
      : `모든 IN_PROGRESS 프로젝트에 최근 ${STALE_DAYS}일 내 업데이트 있음`,
    affectedItems: staleProjects.map((p) => p.id),
  };
}

/**
 * Rule: 동일 1주일 내 휴가 인원 수가 전체 멤버의 30% 이상
 * Severity: INFO
 */
export function timeOffClusteringRule(
  timeOff: TimeOffSummaryRecord[],
  attendance: AttendanceDaySummary[]
): RuleResult {
  const avgTeamSize =
    attendance.length > 0
      ? Math.round(attendance.reduce((sum, d) => sum + d.totalMembers, 0) / attendance.length)
      : 0;

  const threshold = avgTeamSize > 0 ? Math.ceil(avgTeamSize * 0.3) : 3;

  // 주 단위로 동시 휴가 집계 (APPROVED만)
  const weekCountMap = new Map<string, Set<string>>();
  for (const request of timeOff) {
    if (request.status !== "APPROVED") continue;
    const start = new Date(request.startDate);
    const current = new Date(start);
    const end = new Date(request.endDate);
    while (current <= end) {
      const year = current.getFullYear();
      const week = getISOWeek(current);
      const weekKey = `${year}-W${String(week).padStart(2, "0")}`;
      if (!weekCountMap.has(weekKey)) weekCountMap.set(weekKey, new Set());
      weekCountMap.get(weekKey)!.add(request.userId);
      current.setDate(current.getDate() + 7); // 주 단위로 이동
    }
  }

  let maxConcurrent = 0;
  let peakWeek = "";
  for (const [week, users] of weekCountMap.entries()) {
    if (users.size > maxConcurrent) {
      maxConcurrent = users.size;
      peakWeek = week;
    }
  }

  const triggered = maxConcurrent >= threshold && avgTeamSize > 0;
  const ratio = avgTeamSize > 0 ? Math.round((maxConcurrent / avgTeamSize) * 100) : 0;
  const score = triggered ? Math.min(60, ratio) : 0;

  return {
    ruleId: "time-off-clustering",
    name: "동시 휴가 집중 알림",
    triggered,
    severity: "INFO",
    score,
    reason: triggered
      ? `${peakWeek} 주에 ${maxConcurrent}명 동시 휴가 예정 (전체의 ${ratio}%)`
      : "동시 휴가 집중 없음",
    affectedItems: [],
  };
}

/**
 * ISO 주차 계산 헬퍼
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * 룰 결과들로부터 종합 리스크 스코어 계산 (가중 평균)
 * CRITICAL: weight 3 / WARNING: weight 2 / INFO: weight 1
 */
function computeRiskScore(ruleResults: RuleResult[]): number {
  const weights: Record<RuleSeverity, number> = { CRITICAL: 3, WARNING: 2, INFO: 1 };
  let weightedSum = 0;
  let totalWeight = 0;
  for (const rule of ruleResults) {
    const w = weights[rule.severity];
    weightedSum += rule.score * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Orchestrate all analysis functions on collected raw data.
 * Returns a complete AnalysisResult for the report agent.
 */
export function analyzeAll(rawData: {
  projects: ProjectSnapshot[];
  updates: ProjectUpdateRecord[];
  attendance: AttendanceDaySummary[];
  timeOff: TimeOffSummaryRecord[];
}): AnalysisResult {
  const delayedProjects = detectDelayedProjects(rawData.projects);
  const updateGaps = detectUpdateGaps(rawData.projects, rawData.updates);
  const attendanceAnomalies = detectAttendanceAnomalies(rawData.attendance);
  const workforceImpact = calculateWorkforceImpact(rawData.timeOff, rawData.attendance);

  // Phase 2: Rule-based analysis
  const ruleResults: RuleResult[] = [
    blockedProjectRiskRule(rawData.projects),
    delayDurationWarningRule(rawData.projects, rawData.updates),
    timeOffClusteringRule(rawData.timeOff, rawData.attendance),
  ];
  const riskScore = computeRiskScore(ruleResults);

  return {
    delayedProjects,
    updateGaps,
    attendanceAnomalies,
    workforceImpact,
    ruleResults,
    riskScore,
    generatedAt: new Date().toISOString(),
  };
}
