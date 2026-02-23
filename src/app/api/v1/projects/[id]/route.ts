// PMO System - Individual Project API Routes
// GET /api/v1/projects/[id] - Get project detail (all roles)
// PATCH /api/v1/projects/[id] - Update project (OWNER or ADMIN only)
// DELETE /api/v1/projects/[id] - Soft-delete project (OWNER only)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin, requireOwner } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { updateProjectSchema } from "@/lib/validators/project";
import { projectService } from "@/lib/domain/project";
import { createSuccessResponse } from "@/types/api";

/**
 * Extract project ID from URL path.
 */
function extractProjectId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const projectsIndex = segments.indexOf("projects");
  return projectsIndex >= 0 ? segments[projectsIndex + 1] || null : null;
}

/**
 * GET /api/v1/projects/[id]
 * Get a single project detail.
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const projectId = extractProjectId(req.url);
  if (!projectId) {
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Project ID is required.", 400);
  }

  const project = await projectService.getProjectById(projectId, organizationId);

  if (!project) {
    return createErrorResponse(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found.", 404);
  }

  return Response.json(createSuccessResponse(project));
});

/**
 * PATCH /api/v1/projects/[id]
 * Update a project (OWNER or ADMIN only).
 */
export const PATCH = withOrgScope(
  requireAdmin(async (req, { organizationId, session }) => {
    try {
      const projectId = extractProjectId(req.url);
      if (!projectId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Project ID is required.", 400);
      }

      const body = await req.json();

      const parsed = updateProjectSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      const updated = await projectService.updateProject(projectId, organizationId, session.id, parsed.data);

      if (!updated) {
        return createErrorResponse(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found.", 404);
      }

      return Response.json(createSuccessResponse(updated));
    } catch (error) {
      console.error("[PATCH /api/v1/projects/[id]]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);

/**
 * DELETE /api/v1/projects/[id]
 * Soft-delete a project (OWNER only).
 */
export const DELETE = withOrgScope(
  requireOwner(async (req, { organizationId, session }) => {
    const projectId = extractProjectId(req.url);
    if (!projectId) {
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Project ID is required.", 400);
    }

    const deleted = await projectService.deleteProject(projectId, organizationId, session.id);

    if (!deleted) {
      return createErrorResponse(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found.", 404);
    }

    return new Response(null, { status: 204 });
  })
);
