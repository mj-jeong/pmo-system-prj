// PMO System - Attendance Service
// Client-side service for attendance API calls.
// Check-in/check-out timestamps are always server-generated (no client timestamps).

import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { AttendanceResponse, UpdateAttendanceInput, AttendanceQueryInput } from "@/types/attendance";

export interface AttendanceWithUser extends AttendanceResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Record check-in. No body required - server generates timestamp.
 */
export async function checkIn() {
  return apiPost<ApiResponse<AttendanceResponse>>("/attendance/check-in");
}

/**
 * Record check-out. No body required - server generates timestamp.
 */
export async function checkOut() {
  return apiPost<ApiResponse<AttendanceResponse>>("/attendance/check-out");
}

/**
 * Get today's attendance record for the current user.
 */
export async function getTodayAttendance() {
  return apiGet<ApiResponse<AttendanceResponse | null>>("/attendance/today");
}

/**
 * Get all attendance records with filters (admin only).
 */
export async function getAllAttendance(filters?: AttendanceQueryInput) {
  return apiGet<PaginatedResponse<AttendanceWithUser>>("/attendance", filters as any);
}

/**
 * Get a specific user's attendance history (admin only).
 */
export async function getUserAttendance(
  userId: string,
  params?: { startDate?: string; endDate?: string; page?: number; limit?: number }
) {
  return apiGet<PaginatedResponse<AttendanceResponse>>(
    `/attendance/user/${userId}`,
    params as any
  );
}

/**
 * Manual correction of an attendance record (admin only).
 */
export async function updateAttendance(id: string, data: UpdateAttendanceInput) {
  return apiPatch<ApiResponse<AttendanceResponse>>(`/attendance/${id}`, data);
}
