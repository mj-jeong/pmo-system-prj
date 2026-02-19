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
  reason: "STATUS_DELAYED" | "BEHIND_SCHEDULE";
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

export interface AnalysisResult {
  delayedProjects: DelayedProject[];
  updateGaps: UpdateGap[];
  attendanceAnomalies: AttendanceAnomaly[];
  workforceImpact: WorkforceImpact;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Analysis Functions
// ---------------------------------------------------------------------------

/**
 * Detect projects that are delayed or behind schedule.
 *
 * Rules:
 * - STATUS_DELAYED: project.status === "DELAYED"
 * - BEHIND_SCHEDULE: progress < expected progress based on elapsed timeline
 */
export function detectDelayedProjects(projects: ProjectSnapshot[]): DelayedProject[] {
  const results: DelayedProject[] = [];
  const now = new Date();

  for (const project of projects) {
    // Rule 1: Explicit DELAYED status
    if (project.status === "DELAYED") {
      results.push({
        projectId: project.id,
        projectName: project.name,
        status: project.status,
        progress: project.progress,
        expectedProgress: null,
        reason: "STATUS_DELAYED",
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

  return {
    delayedProjects,
    updateGaps,
    attendanceAnomalies,
    workforceImpact,
    generatedAt: new Date().toISOString(),
  };
}
