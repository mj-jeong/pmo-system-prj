// PMO System - Project Type Definitions

import type { ProjectStatus } from "./index";

/**
 * Project creation input.
 */
export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  progress?: number;
}

/**
 * Project update input.
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  progress?: number;
}

/**
 * Project response shape (from API).
 */
export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project update (log entry) creation input.
 */
export interface CreateProjectUpdateInput {
  content: string;
}

/**
 * Project update (log entry) response shape.
 */
export interface ProjectUpdateResponse {
  id: string;
  content: string;
  projectId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
