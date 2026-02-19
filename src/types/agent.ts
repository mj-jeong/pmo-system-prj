// PMO System - Agent Type Definitions
// Types for agent run tracking, steps, and tool call observability.

import type { AgentRunStatus, AgentStepName, AgentStepStatus } from "@prisma/client";

// ============================================================================
// Tool Call Response
// ============================================================================

/**
 * Tool call response shape (from API).
 * Represents a single tool invocation during an agent step.
 */
export interface ToolCallResponse {
  id: string;
  toolName: string;
  latencyMs: number | null;
  error: string | null;
  createdAt: string;
}

// ============================================================================
// Agent Step Response
// ============================================================================

/**
 * Agent step response shape (from API).
 * Represents a single phase in the agent pipeline.
 */
export interface AgentStepResponse {
  id: string;
  stepName: AgentStepName;
  status: AgentStepStatus;
  inputData: unknown | null;
  outputData: unknown | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  toolCalls: ToolCallResponse[];
  createdAt: string;
}

// ============================================================================
// Agent Run Response
// ============================================================================

/**
 * Agent run response shape (from API).
 * Represents a full agent execution lifecycle.
 */
export interface AgentRunResponse {
  id: string;
  organizationId: string;
  createdById: string;
  status: AgentRunStatus;
  inputParams: unknown;
  outputSummary: unknown | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  reportId: string | null;
  steps: AgentStepResponse[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Agent Run List Response (Paginated)
// ============================================================================

/**
 * Paginated list of agent runs.
 * Matches the existing PaginatedResponse pattern from src/types/api.ts.
 */
export interface AgentRunListResponse {
  success: true;
  data: AgentRunResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
