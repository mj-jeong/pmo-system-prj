// PMO System - Agent Service
// Client-side service for agent and report API calls.

import { apiGet, apiPost } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

// ============================================================================
// Request/Response Types
// ============================================================================

export type AgentRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type AgentStepName = "PLAN" | "COLLECT" | "ANALYZE" | "SUMMARIZE" | "DRAFT";
export type AgentStepStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
export type ReportStatus = "DRAFT" | "PUBLISHED";
export type DetailLevel = "BRIEF" | "STANDARD" | "DETAILED";

export interface GenerateReportInput {
  periodStart: string;
  periodEnd: string;
  projectIds: string[];
  detailLevel: DetailLevel;
}

export interface GenerateReportResponse {
  runId: string;
  reportId: string | null;
  status: AgentRunStatus;
}

export interface AgentRunListItem {
  id: string;
  status: AgentRunStatus;
  inputParams: {
    periodStart: string;
    periodEnd: string;
    projectIds: string[];
    detailLevel: DetailLevel;
  };
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  reportId: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface ToolCall {
  id: string;
  toolName: string;
  requestPayload: any;
  responsePayload: any;
  latencyMs: number | null;
  error: string | null;
  createdAt: string;
}

export interface AgentStep {
  id: string;
  stepName: AgentStepName;
  status: AgentStepStatus;
  inputData: any;
  outputData: any;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  toolCalls: ToolCall[];
}

export interface AgentRunDetail extends AgentRunListItem {
  steps: AgentStep[];
  outputSummary: any;
}

export interface ReportListItem {
  id: string;
  periodStart: string;
  periodEnd: string;
  projectIds: string[];
  detailLevel: DetailLevel;
  status: ReportStatus;
  createdAt: string;
  publishedAt: string | null;
  createdBy: {
    id: string;
    name: string;
  };
  publishedBy: {
    id: string;
    name: string;
  } | null;
  agentRun: {
    id: string;
    status: AgentRunStatus;
  } | null;
}

export interface ReportDetail extends ReportListItem {
  draftMarkdown: string;
  publishedMarkdown: string | null;
  structuredData: any;
  reasoningTrace: {
    inputSummary: {
      projectCount: number;
      updateCount: number;
      period: { start: string; end: string };
    };
    appliedRules: Array<{
      ruleId: string;
      name: string;
      triggered: boolean;
      severity: "INFO" | "WARNING" | "CRITICAL";
      score: number;
      reason: string;
      affectedItems: string[];
    }>;
    riskScore: number;
  } | null;
  comparisonData: {
    previousReportId: string;
    previousPeriod: { start: string; end: string };
    deltas: {
      projectCount: number;
      blockedCount: number;
      avgProgress: number;
      riskScore: number;
    };
  } | null;
}

export interface AgentRunFilter {
  page?: number;
  limit?: number;
  status?: AgentRunStatus;
}

export interface ReportFilter {
  page?: number;
  limit?: number;
  status?: ReportStatus;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Trigger a new PMO report generation run.
 * POST /api/v1/agent/generate
 */
export async function generateReport(input: GenerateReportInput) {
  return apiPost<ApiResponse<GenerateReportResponse>>("/agent/generate", input);
}

/**
 * List agent runs with pagination and optional status filter.
 * GET /api/v1/agent/runs
 */
export async function listRuns(params?: AgentRunFilter) {
  return apiGet<PaginatedResponse<AgentRunListItem>>("/agent/runs", params as any);
}

/**
 * Get a single agent run with full step and tool call trace.
 * GET /api/v1/agent/runs/[id]
 */
export async function getRun(id: string) {
  return apiGet<ApiResponse<AgentRunDetail>>(`/agent/runs/${id}`);
}

/**
 * List reports with pagination and optional status filter.
 * GET /api/v1/reports
 */
export async function listReports(params?: ReportFilter) {
  return apiGet<PaginatedResponse<ReportListItem>>("/reports", params as any);
}

/**
 * Get a single report with markdown content.
 * GET /api/v1/reports/[id]
 */
export async function getReport(id: string) {
  return apiGet<ApiResponse<ReportDetail>>(`/reports/${id}`);
}

/**
 * Publish a DRAFT report.
 * POST /api/v1/reports/[id]/publish
 */
export async function publishReport(id: string) {
  return apiPost<ApiResponse<ReportDetail>>(`/reports/${id}/publish`);
}
