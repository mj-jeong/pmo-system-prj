// PMO System - Attendance Type Definitions

import type { AttendanceStatus } from "./index";

/**
 * Attendance response shape (from API).
 * Check-in/check-out timestamps are server-generated (button-based workflow).
 */
export interface AttendanceResponse {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Manual attendance correction input (ADMIN/OWNER only).
 */
export interface UpdateAttendanceInput {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
}

/**
 * Attendance query filters.
 */
export interface AttendanceQueryInput {
  userId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
