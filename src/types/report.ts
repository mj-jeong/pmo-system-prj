// PMO System - Report Type Definitions
// Types for generated PMO reports, analysis results, and report lifecycle.

import type { DetailLevel, ReportStatus } from "@prisma/client";
import type { AgentRunResponse } from "./agent";

// ============================================================================
// Analysis Result
// ============================================================================

/**
 * Structured analysis output from the deterministic analysis engine.
 * Contains computed insights without any AI-generated content.
 */
export interface AnalysisResult {
  highlights: string[];
  risks: string[];
  metrics: {
    totalProjects: number;
    delayedProjects: number;
    completedProjects: number;
    averageProgress: number;
    totalUpdates: number;
    averageAttendanceRate: number;
    totalTimeOffRequests: number;
    approvedTimeOffs: number;
  };
  workforceNotes: string[];
}

// ============================================================================
// Generate Report Input
// ============================================================================

/**
 * Input for generating a new PMO report via the agent.
 */
export interface GenerateReportInput {
  periodStart: Date;
  periodEnd: Date;
  projectIds: string[];
  detailLevel: DetailLevel;
}

// ============================================================================
// Report Response
// ============================================================================

/**
 * Report response shape (from API).
 */
export interface ReportResponse {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  projectIds: string[];
  detailLevel: DetailLevel;
  status: ReportStatus;
  draftMarkdown: string;
  publishedMarkdown: string | null;
  structuredData: AnalysisResult | null;
  createdById: string;
  publishedAt: string | null;
  publishedById: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Report List Response (Paginated)
// ============================================================================

/**
 * Paginated list of reports.
 * Matches the existing PaginatedResponse pattern from src/types/api.ts.
 */
export interface ReportListResponse {
  success: true;
  data: ReportResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Report Detail Response
// ============================================================================

/**
 * Detailed report response with associated agent run data.
 * Used for the report detail page to show both content and execution trace.
 */
export interface ReportDetailResponse extends ReportResponse {
  agentRun: AgentRunResponse | null;
}
