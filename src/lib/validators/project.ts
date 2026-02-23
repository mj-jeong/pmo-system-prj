// PMO System - Project Validators
// Zod schemas for project API input validation.

import { z } from "zod";

const projectStatusEnum = z.enum(["PLANNED", "IN_PROGRESS", "BLOCKED", "COMPLETED"]);

/**
 * Schema for creating a new project.
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(200, "Project name must not exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  status: projectStatusEnum.optional().default("IN_PROGRESS"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  progress: z.number().int().min(0).max(100).optional().default(0),
});

/**
 * Schema for updating an existing project.
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(200, "Project name must not exceed 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  status: projectStatusEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

/**
 * Schema for project status update only.
 */
export const updateProjectStatusSchema = z.object({
  status: projectStatusEnum,
});

/**
 * Schema for creating a project update (log entry).
 */
export const createProjectUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Update content is required")
    .max(5000, "Update content must not exceed 5000 characters"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type CreateProjectUpdateInput = z.infer<typeof createProjectUpdateSchema>;
