// PMO System - Organization Service
// Client-side service for organization API calls.

import { apiGet, apiPatch, apiDelete } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { OrganizationResponse, UpdateOrganizationInput } from "@/types/organization";

export type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface WorkspaceSettings {
  id: string;
  name: string;
  slug: string;
  workingHoursStart: number | null;
  workingHoursEnd: number | null;
  weeklyReportDay: WeekDay | null;
  updatedAt: string;
}

export interface UpdateWorkspaceSettingsInput {
  workingHoursStart?: number;
  workingHoursEnd?: number;
  weeklyReportDay?: WeekDay;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string };
}

export async function getCurrentOrg() {
  return apiGet<ApiResponse<OrganizationResponse>>("/organizations/current");
}

export async function updateOrg(data: UpdateOrganizationInput) {
  return apiPatch<ApiResponse<OrganizationResponse>>(
    "/organizations/current",
    data
  );
}

export async function deleteOrg() {
  return apiDelete("/organizations/current");
}

export async function getWorkspaceSettings() {
  return apiGet<ApiResponse<WorkspaceSettings>>("/settings/organization");
}

export async function updateWorkspaceSettings(data: UpdateWorkspaceSettingsInput) {
  return apiPatch<ApiResponse<WorkspaceSettings>>("/settings/organization", data);
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
}) {
  return apiGet<PaginatedResponse<AuditLogEntry>>("/settings/audit-logs", params as Record<string, string | number | undefined>);
}
