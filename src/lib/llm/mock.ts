// PMO System - Mock LLM Provider
// Generates deterministic mock narrative reports without any API calls.
// Uses actual project data from ReportContext for realistic output.
// All sections include clear "MOCK REPORT" warnings.
// Pure computation - no external dependencies, no side effects.

import type { ReportContext } from "@/lib/ai/prompts";
import type { LLMProvider, NarrativeResult } from "./provider";

// ---------------------------------------------------------------------------
// MockLLMProvider
// ---------------------------------------------------------------------------

/**
 * Mock LLM provider that generates reports using deterministic logic.
 * - Zero API calls, zero cost
 * - Uses real project data from ReportContext
 * - Includes "MOCK REPORT" warnings in all sections
 * - Deterministic: same input produces same output
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = "MockLLMProvider";

  async generateNarrative(reportContext: ReportContext): Promise<NarrativeResult> {
    return generateMockNarrative(reportContext);
  }
}

// ---------------------------------------------------------------------------
// Mock Narrative Generator (extracted from openai-client.ts)
// ---------------------------------------------------------------------------

/**
 * Generate a mock narrative report without calling any LLM API.
 * Uses actual project data from reportContext to produce realistic output.
 * All sections include clear "MOCK REPORT" warnings.
 * Pure function - no external API calls, no side effects.
 */
function generateMockNarrative(reportContext: ReportContext): NarrativeResult {
  const { projects, updates, attendance, timeOff, analysis, periodStart, periodEnd, organizationName } = reportContext;

  const totalProjects = projects.length;
  const blockedCount = analysis.delayedProjects.length;
  const inProgressCount = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;

  // Calculate average attendance rate from the data
  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.rate, 0) / attendance.length)
    : 0;

  // Time-off counts
  const approvedLeaves = timeOff.filter((t) => t.status === "APPROVED").length;
  const pendingLeaves = timeOff.filter((t) => t.status === "PENDING").length;

  // Project names for display
  const blockedProjectNames = analysis.delayedProjects.map((d) => d.projectName);
  const gapProjectNames = analysis.updateGaps.map((g) => g.projectName);

  const executiveSummary = `> **MOCK REPORT - Development Mode** (no LLM API calls were made)

This weekly report covers the period **${periodStart}** to **${periodEnd}** for **${organizationName}**.

**Portfolio Summary**: ${totalProjects} project(s) tracked - ${inProgressCount} in progress, ${blockedCount} blocked, ${completedCount} completed.

**Workforce**: Average attendance rate of ${avgAttendance}% across the period. ${approvedLeaves} approved leave(s), ${pendingLeaves} pending request(s).

${blockedCount > 0 ? `**Key Risks**: ${blockedCount} project(s) flagged as blocked: ${blockedProjectNames.join(", ")}.` : "**Key Risks**: No projects currently blocked."}

${gapProjectNames.length > 0 ? `**Update Gaps**: ${gapProjectNames.length} project(s) with no updates during this period: ${gapProjectNames.join(", ")}.` : ""}`;

  const projectNarrative = `> **MOCK REPORT - Development Mode**

## Project Highlights

${projects.map((p) => {
    const projectUpdates = updates.filter((u) => u.projectName === p.name);
    const isDelayed = analysis.delayedProjects.some((d) => d.projectName === p.name);
    const hasGap = analysis.updateGaps.some((g) => g.projectName === p.name);

    return `### ${p.name}
- **Status**: ${p.status} | **Progress**: ${p.progress}%
- **Timeline**: ${p.startDate || "N/A"} to ${p.endDate || "N/A"}
- **Updates this period**: ${projectUpdates.length} update(s)
${isDelayed ? "- **Risk**: Project is BLOCKED" : ""}
${hasGap ? "- **Warning**: No updates recorded during this period" : ""}`;
  }).join("\n\n")}`;

  const workforceNarrative = `> **MOCK REPORT - Development Mode**

## Workforce & Availability

- **Average Attendance Rate**: ${avgAttendance}%
- **Days Tracked**: ${attendance.length}
- **Attendance Anomalies**: ${analysis.attendanceAnomalies.length} day(s) below 70% threshold
- **Approved Leaves**: ${approvedLeaves}
- **Pending Leave Requests**: ${pendingLeaves}

${analysis.attendanceAnomalies.length > 0 ? `**Low Attendance Days**: ${analysis.attendanceAnomalies.map((a) => `${a.date} (${a.rate}%)`).join(", ")}` : "No attendance anomalies detected."}`;

  // Build progress snapshot table
  const progressTableRows = projects.map((p) =>
    `| ${p.name} | ${p.status} | ${p.progress}% | ${p.startDate || "N/A"} | ${p.endDate || "N/A"} |`
  ).join("\n");

  const markdown = `# PMO Weekly Report: ${periodStart} to ${periodEnd}

> **MOCK REPORT - Development Mode**
> This report was generated using mock data processing. No LLM API calls were made.
> Set LLM_MODE=real in production to use real AI narrative generation.

---

## Executive Summary

${executiveSummary}

---

## Project Highlights

${projectNarrative}

---

## Risks & Blockers

${blockedCount > 0 ? `### Blocked Projects\n${blockedProjectNames.map((n) => `- [ ] Review and unblock: **${n}**`).join("\n")}` : "No blocked projects."}

${gapProjectNames.length > 0 ? `### Update Gaps\n${gapProjectNames.map((n) => `- [ ] Request status update from: **${n}**`).join("\n")}` : "No update gaps detected."}

${analysis.attendanceAnomalies.length > 0 ? `### Attendance Concerns\n- [ ] Investigate low attendance on: ${analysis.attendanceAnomalies.map((a) => a.date).join(", ")}` : "No attendance concerns."}

---

## Progress Snapshot

| Project | Status | Progress | Start Date | End Date |
|---------|--------|----------|------------|----------|
${progressTableRows}

---

## Workforce & Availability

${workforceNarrative}

---

## Next Week Plan

- [ ] Review delayed projects and create recovery plans
- [ ] Follow up on projects with no updates this period
- [ ] Address any attendance anomalies identified
- [ ] Review pending leave requests for capacity planning

---

## Appendix: Data Sources

- **Projects**: ${totalProjects} project(s) tracked
- **Project Updates**: ${updates.length} update(s) in reporting period
- **Attendance Records**: ${attendance.length} day(s) of attendance data
- **Time-Off Records**: ${timeOff.length} leave request(s)
- **Analysis Engine**: Deterministic analysis (v1.0)
- **LLM Provider**: MockLLMProvider (Development Mode)

---
*Report generated in Mock LLM mode. Total projects: ${totalProjects} | Period: ${periodStart} to ${periodEnd}*`;

  console.log(`[LLM] MockLLMProvider - generated report for ${organizationName} (${totalProjects} projects, period: ${periodStart} to ${periodEnd})`);

  return {
    executiveSummary,
    projectNarrative,
    workforceNarrative,
    markdown,
  };
}
