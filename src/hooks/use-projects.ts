"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectService from "@/lib/services/project.service";
import type { ProjectFilter } from "@/types";
import type { CreateProjectInput, UpdateProjectInput } from "@/types/project";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

export const projectKeys = {
  all: ["projects"] as const,
  list: (params?: ProjectFilter) => [...projectKeys.all, "list", params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects(params?: ProjectFilter) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showSuccessToast("Project created successfully.");
    },
    onError: handleApiError,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      showSuccessToast("Project updated successfully.");
    },
    onError: handleApiError,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showSuccessToast("Project deleted successfully.");
    },
    onError: handleApiError,
  });
}
