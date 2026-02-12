"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgService from "@/lib/services/organization.service";
import type { UpdateOrganizationInput } from "@/types/organization";
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
