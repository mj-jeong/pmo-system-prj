// PMO System - Project Updates API Routes
// GET /api/v1/projects/[id]/updates - List project updates
// POST /api/v1/projects/[id]/updates - Add project update

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createProjectUpdateSchema } from "@/lib/validators/project";
import { projectService } from "@/lib/domain/project";
import { createSuccessResponse, createPaginatedResponse } from "@/types/api";

/**
 * Extract project ID from URL path.
 */
function extractProjectId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const projectsIndex = segments.indexOf("projects");
  return projectsIndex >= 0 ? segments[projectsIndex + 1] || null : null;
}

/**
 * GET /api/v1/projects/[id]/updates
 * List project updates for a specific project.
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const projectId = extractProjectId(req.url);
  if (!projectId) {
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Project ID is required.", 400);
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

  const result = await projectService.getProjectUpdates(projectId, organizationId, page, limit);

  if (result === null) {
    return createErrorResponse(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found.", 404);
  }

  return Response.json(
    createPaginatedResponse(result.data, result.total, result.page, result.limit)
  );
});

/**
 * POST /api/v1/projects/[id]/updates
 * Add a new project update (log entry).
 */
export const POST = withOrgScope(async (req, { session, organizationId }) => {
  try {
    const projectId = extractProjectId(req.url);
    if (!projectId) {
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Project ID is required.", 400);
    }

    const body = await req.json();

    const parsed = createProjectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    const update = await projectService.addProjectUpdate(
      projectId,
      organizationId,
      { content: parsed.data.content },
      session.id
    );

    if (!update) {
      return createErrorResponse(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found.", 404);
    }

    return Response.json(createSuccessResponse(update), { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/projects/[id]/updates]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
});
