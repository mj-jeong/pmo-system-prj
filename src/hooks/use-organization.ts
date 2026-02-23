"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgService from "@/lib/services/organization.service";
import type { UpdateOrganizationInput } from "@/types/organization";
import type { UpdateWorkspaceSettingsInput } from "@/lib/services/organization.service";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

export const orgKeys = {
  all: ["organization"] as const,
  current: () => [...orgKeys.all, "current"] as const,
};

export function useOrganization() {
  return useQuery({
    queryKey: orgKeys.current(),
    queryFn: () => orgService.getCurrentOrg(),
    select: (res) => res.data,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationInput) => orgService.updateOrg(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
      showSuccessToast("Organization updated successfully.");
    },
    onError: handleApiError,
  });
}

export function useDeleteOrganization() {
  return useMutation({
    mutationFn: () => orgService.deleteOrg(),
    onSuccess: () => {
      showSuccessToast("Organization deleted.");
      // Redirect will be handled by the caller
    },
    onError: handleApiError,
  });
}

export const workspaceSettingsKeys = {
  all: ["workspaceSettings"] as const,
  current: () => [...workspaceSettingsKeys.all, "current"] as const,
};

export function useWorkspaceSettings() {
  return useQuery({
    queryKey: workspaceSettingsKeys.current(),
    queryFn: () => orgService.getWorkspaceSettings(),
    select: (res) => res.data,
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceSettingsInput) =>
      orgService.updateWorkspaceSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceSettingsKeys.all });
      showSuccessToast("Workspace settings updated.");
    },
    onError: handleApiError,
  });
}

export const auditLogKeys = {
  all: ["auditLogs"] as const,
  list: (params: Record<string, unknown>) =>
    [...auditLogKeys.all, "list", params] as const,
};

export function useAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
}) {
  return useQuery({
    queryKey: auditLogKeys.list(params ?? {}),
    queryFn: () => orgService.getAuditLogs(params),
  });
}
