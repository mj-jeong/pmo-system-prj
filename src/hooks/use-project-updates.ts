"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectService from "@/lib/services/project.service";
import type { CreateProjectUpdateInput } from "@/types/project";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";
import { projectKeys } from "./use-projects";

export const projectUpdateKeys = {
  all: ["project-updates"] as const,
  list: (projectId: string, params?: { page?: number; limit?: number }) =>
    [...projectUpdateKeys.all, projectId, params] as const,
};

export function useProjectUpdates(
  projectId: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: projectUpdateKeys.list(projectId, params),
    queryFn: () => projectService.getProjectUpdates(projectId, params),
    enabled: !!projectId,
  });
}

export function useAddProjectUpdate(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectUpdateInput) =>
      projectService.addProjectUpdate(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectUpdateKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      showSuccessToast("Update added successfully.");
    },
    onError: handleApiError,
  });
}
