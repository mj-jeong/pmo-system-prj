// PMO System - Project Service
// Client-side service for project API calls.

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ProjectResponse, CreateProjectInput, UpdateProjectInput, ProjectUpdateResponse, CreateProjectUpdateInput } from "@/types/project";
import type { ProjectFilter } from "@/types";

export interface ProjectDetailResponse extends ProjectResponse {
  _count: {
    updates: number;
  };
}

export interface ProjectUpdateWithAuthor extends ProjectUpdateResponse {
  author: {
    id: string;
    name: string;
  };
}

export async function getProjects(params?: ProjectFilter) {
  return apiGet<PaginatedResponse<ProjectResponse>>("/projects", params as any);
}

export async function getProject(id: string) {
  return apiGet<ApiResponse<ProjectDetailResponse>>(`/projects/${id}`);
}

export async function createProject(data: CreateProjectInput) {
  return apiPost<ApiResponse<ProjectResponse>>("/projects", data);
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  return apiPatch<ApiResponse<ProjectResponse>>(`/projects/${id}`, data);
}

export async function deleteProject(id: string) {
  return apiDelete(`/projects/${id}`);
}

export async function getProjectUpdates(
  projectId: string,
  params?: { page?: number; limit?: number }
) {
  return apiGet<PaginatedResponse<ProjectUpdateWithAuthor>>(
    `/projects/${projectId}/updates`,
    params as any
  );
}

export async function addProjectUpdate(
  projectId: string,
  data: CreateProjectUpdateInput
) {
  return apiPost<ApiResponse<ProjectUpdateResponse>>(
    `/projects/${projectId}/updates`,
    data
  );
}
