"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as agentService from "@/lib/services/agent.service";
import type {
  GenerateReportInput,
  AgentRunFilter,
  ReportFilter,
} from "@/lib/services/agent.service";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

// ============================================================================
// Query Keys
// ============================================================================

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (params?: ReportFilter) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

export const agentRunKeys = {
  all: ["agentRuns"] as const,
  lists: () => [...agentRunKeys.all, "list"] as const,
  list: (params?: AgentRunFilter) => [...agentRunKeys.lists(), params] as const,
  details: () => [...agentRunKeys.all, "detail"] as const,
  detail: (id: string) => [...agentRunKeys.details(), id] as const,
};

// ============================================================================
// Report Hooks
// ============================================================================

/**
 * List reports with pagination and optional status filter.
 */
export function useReports(params?: ReportFilter) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => agentService.listReports(params),
  });
}

/**
 * Get a single report with markdown content.
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => agentService.getReport(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

/**
 * Publish a DRAFT report.
 */
export function usePublishReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentService.publishReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
      showSuccessToast("Report published successfully.");
    },
    onError: handleApiError,
  });
}

// ============================================================================
// Agent Run Hooks
// ============================================================================

/**
 * List agent runs with pagination and optional status filter.
 */
export function useAgentRuns(params?: AgentRunFilter) {
  return useQuery({
    queryKey: agentRunKeys.list(params),
    queryFn: () => agentService.listRuns(params),
  });
}

/**
 * Get a single agent run with full step and tool call trace.
 * Auto-polls every 3 seconds when status is RUNNING.
 */
export function useAgentRun(id: string) {
  return useQuery({
    queryKey: agentRunKeys.detail(id),
    queryFn: () => agentService.getRun(id),
    select: (res) => res.data,
    enabled: !!id,
    refetchInterval: (query) => {
      const apiResponse = query.state.data;
      const status = apiResponse?.data?.status;
      return status === "RUNNING" ? 3000 : false;
    },
  });
}

/**
 * Trigger a new PMO report generation run.
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateReportInput) => agentService.generateReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentRunKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      showSuccessToast("Report generation started.");
    },
    onError: handleApiError,
  });
}
