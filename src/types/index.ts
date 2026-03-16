// PMO System - Domain Type Definitions
// Re-exports and domain-specific types

export type { ApiResponse, PaginatedResponse, PaginationParams } from "./api";

// ============================================================================
// Role Types
// ============================================================================

export type RoleName = "OWNER" | "ADMIN" | "MEMBER";

// ============================================================================
// Project Types
// ============================================================================

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

export interface ProjectFilter extends PaginationParams {
  status?: ProjectStatus;
  search?: string;
}

// ============================================================================
// Attendance Types
// ============================================================================

export type AttendanceStatus = "CHECKED_IN" | "CHECKED_OUT" | "ABSENT";

export interface AttendanceFilter extends PaginationParams {
  userId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Time-Off Types
// ============================================================================

export type TimeOffType =
  | "VACATION"
  | "HALF_DAY"
  | "QUARTER_DAY"
  | "SICK"
  | "SPECIAL"
  | "CONDOLENCE"
  | "HEALTH"
  | "UNPAID"
  | "PAID";
export type TimeOffStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TimeOffFilter extends PaginationParams {
  userId?: string;
  status?: TimeOffStatus;
  type?: TimeOffType;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardSummary {
  totalProjects: number;
  blockedProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  averageProgress: number;
}

export interface WorkforceSummary {
  totalMembers: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
}

// ============================================================================
// Session Types
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: RoleName;
}

// Re-export PaginationParams for filters
import type { PaginationParams } from "./api";
