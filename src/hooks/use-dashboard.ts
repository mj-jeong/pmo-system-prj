"use client";

import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "@/lib/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  workforce: () => [...dashboardKeys.all, "workforce"] as const,
  recentUpdates: (limit?: number) =>
    [...dashboardKeys.all, "recent-updates", limit] as const,
};

/**
 * Dashboard summary metrics. Polls every 60 seconds.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
    select: (res) => res.data,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Workforce summary for today. Polls every 60 seconds.
 */
export function useWorkforceSummary() {
  return useQuery({
    queryKey: dashboardKeys.workforce(),
    queryFn: () => dashboardService.getWorkforceSummary(),
    select: (res) => res.data,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Recent project updates. Polls every 60 seconds.
 */
export function useRecentUpdates(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentUpdates(limit),
    queryFn: () => dashboardService.getRecentUpdates(limit),
    select: (res) => res.data,
    refetchInterval: 60 * 1000,
  });
}
