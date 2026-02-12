// PMO System - Dashboard Service
// Client-side service for dashboard API calls.

import { apiGet } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { DashboardSummary, WorkforceSummary } from "@/types";

export interface RecentUpdate {
  id: string;
  content: string;
  project: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export async function getSummary() {
  return apiGet<ApiResponse<DashboardSummary>>("/dashboard/summary");
}

export async function getWorkforceSummary() {
  return apiGet<ApiResponse<WorkforceSummary>>("/dashboard/workforce");
}

export async function getRecentUpdates(limit?: number) {
  return apiGet<ApiResponse<RecentUpdate[]>>("/dashboard/recent-updates", {
    limit,
  });
}
