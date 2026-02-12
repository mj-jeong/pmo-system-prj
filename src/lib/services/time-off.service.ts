// PMO System - Time-Off Service
// Client-side service for time-off API calls.

import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  TimeOffResponse,
  CreateTimeOffInput,
  UpdateTimeOffInput,
} from "@/types/time-off";
import type { TimeOffFilter } from "@/types";

export interface TimeOffWithUser extends TimeOffResponse {
  user: {
    id: string;
    name: string;
  };
}

export async function getTimeOffs(params?: TimeOffFilter) {
  return apiGet<PaginatedResponse<TimeOffWithUser>>("/time-off", params as any);
}

export async function createTimeOff(data: CreateTimeOffInput) {
  return apiPost<ApiResponse<TimeOffResponse>>("/time-off", data);
}

export async function updateTimeOff(id: string, data: UpdateTimeOffInput) {
  return apiPatch<ApiResponse<TimeOffResponse>>(`/time-off/${id}`, data);
}

export async function approveTimeOff(id: string) {
  return apiPatch<ApiResponse<TimeOffResponse>>(`/time-off/${id}/approve`);
}

export async function rejectTimeOff(id: string) {
  return apiPatch<ApiResponse<TimeOffResponse>>(`/time-off/${id}/reject`);
}
