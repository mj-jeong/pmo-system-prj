// PMO System - AI Prompt Templates
// Structured prompt templates for PMO report narrative generation.
// Anti-hallucination instructions are embedded in every prompt.

import type { AnalysisResult } from "@/lib/domain/agent-analysis";
import type {
  ProjectSnapshot,
  ProjectUpdateRecord,
  AttendanceDaySummary,
  TimeOffSummaryRecord,
} from "@/lib/domain/agent-tools";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DetailLevel = "BRIEF" | "STANDARD" | "DETAILED";

export interface ReportContext {
  periodStart: string;
  periodEnd: string;
  organizationName: string;
  projects: ProjectSnapshot[];
  updates: ProjectUpdateRecord[];
  attendance: AttendanceDaySummary[];
  timeOff: TimeOffSummaryRecord[];
  analysis: AnalysisResult;
  detailLevel: DetailLevel;
}

// ---------------------------------------------------------------------------
// Anti-Hallucination Instructions
// ---------------------------------------------------------------------------

const ANTI_HALLUCINATION = `
STRICT DATA RULES:
- Do NOT invent facts, numbers, or events not present in the provided data.
- Do NOT modify any metrics, percentages, or counts from the source data.
- Use ONLY the data provided below. If data is missing, state "No data available" rather than guessing.
- Do NOT assume reasons for delays, absences, or gaps unless explicitly stated in project updates.
- Reference specific project names, dates, and numbers directly from the data.
`.trim();

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

/**
 * System prompt defining the AI role as a PMO report writer.
 */
export const SYSTEM_PROMPT = `You are a professional PMO (Project Management Office) report writer.
Your task is to produce clear, factual weekly status reports based on provided project and workforce data.

${ANTI_HALLUCINATION}

WRITING STYLE:
- Professional and concise tone suitable for executive stakeholders.
- Use bullet points for lists of findings.
- Highlight risks and action items clearly.
- Structure output with clear markdown headings.
- Keep sentences factual and data-driven.
`;

/**
 * Prompt for generating the executive summary section.
 */
export const EXECUTIVE_SUMMARY_PROMPT = `Generate a concise executive summary for this PMO weekly report.

${ANTI_HALLUCINATION}

Include:
1. Overall portfolio health (number of projects, status distribution)
2. Key risks identified (delayed projects, update gaps)
3. Workforce overview (attendance trends, leave impact)
4. Top 2-3 action items for leadership attention

Keep it to 3-5 paragraphs maximum.
`;

/**
 * Prompt for generating the project narrative section.
 */
export const PROJECT_NARRATIVE_PROMPT = `Generate a project status narrative for each project.

${ANTI_HALLUCINATION}

For each project, include:
1. Current status and progress percentage
2. Key updates from the reporting period (reference specific update content)
3. Risk flags (delayed status, behind schedule, no recent updates)
4. Timeline assessment (on track, at risk, or delayed)

Group projects by status: Delayed first, then In Progress, then Completed.
`;

/**
 * Prompt for generating the workforce narrative section.
 */
export const WORKFORCE_NARRATIVE_PROMPT = `Generate a workforce status narrative.

${ANTI_HALLUCINATION}

Include:
1. Attendance trends across the reporting period
2. Any attendance anomalies detected (dates with low attendance)
3. Time-off summary (approved, pending, by type)
4. Workforce impact assessment (leave concentration, team capacity)

Be factual and reference specific dates and numbers from the data.
`;

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Build the complete user prompt with all data context for narrative generation.
 * Sanitizes data before embedding (no emails, no hashed passwords).
 */
export function buildReportPrompt(
  context: ReportContext,
  detailLevel: DetailLevel
): string {
  const lengthGuidance =
    detailLevel === "BRIEF"
      ? "Keep the report concise: maximum 800 words total."
      : detailLevel === "DETAILED"
        ? "Provide a comprehensive report with detailed project-by-project analysis. Target 2000-3000 words."
        : "Provide a balanced report with moderate detail. Target 1200-1800 words.";

  // Sanitize projects (remove any sensitive fields)
  const sanitizedProjects = context.projects.map((p) => ({
    name: p.name,
    status: p.status,
    progress: p.progress,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  // Sanitize updates (remove IDs, keep content)
  const sanitizedUpdates = context.updates.map((u) => ({
    projectName: u.projectName,
    authorName: u.authorName,
    content: u.content,
    createdAt: u.createdAt,
  }));

  // Sanitize attendance (already aggregated, no PII)
  const sanitizedAttendance = context.attendance.map((a) => ({
    date: a.date,
    totalMembers: a.totalMembers,
    present: a.present,
    absent: a.absent,
    rate: a.rate,
  }));

  // Sanitize time-off (remove user IDs)
  const sanitizedTimeOff = context.timeOff.map((t) => ({
    userName: t.userName,
    type: t.type,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    days: t.days,
  }));

  return `
Generate a complete PMO Weekly Report for the period ${context.periodStart} to ${context.periodEnd}.
Organization: ${context.organizationName}

${lengthGuidance}

${ANTI_HALLUCINATION}

=== PROJECT DATA ===
${JSON.stringify(sanitizedProjects, null, 2)}

=== PROJECT UPDATES (during reporting period) ===
${JSON.stringify(sanitizedUpdates, null, 2)}

=== ATTENDANCE DATA ===
${JSON.stringify(sanitizedAttendance, null, 2)}

=== TIME-OFF DATA ===
${JSON.stringify(sanitizedTimeOff, null, 2)}

=== ANALYSIS RESULTS ===
Delayed Projects: ${JSON.stringify(context.analysis.delayedProjects, null, 2)}
Update Gaps: ${JSON.stringify(context.analysis.updateGaps, null, 2)}
Attendance Anomalies: ${JSON.stringify(context.analysis.attendanceAnomalies, null, 2)}
Workforce Impact: ${JSON.stringify(context.analysis.workforceImpact, null, 2)}

=== REQUIRED OUTPUT FORMAT ===
Respond with valid JSON containing exactly these four fields:

{
  "executiveSummary": "Markdown string with executive summary",
  "projectNarrative": "Markdown string with project-by-project status",
  "workforceNarrative": "Markdown string with workforce and attendance analysis",
  "markdown": "Complete markdown report combining all sections with proper headings"
}

The "markdown" field should be the full report with these sections:
# PMO Weekly Report: [period]
## Executive Summary
## Project Status
## Workforce & Attendance
## Risks & Action Items
`.trim();
}
