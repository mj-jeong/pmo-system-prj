// PMO System - Projects API Routes
// GET /api/v1/projects - List projects (pagination, filters) - all roles
// POST /api/v1/projects - Create project (OWNER or ADMIN only)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createProjectSchema } from "@/lib/validators/project";
import { projectService } from "@/lib/domain/project";
import { createSuccessResponse, createPaginatedResponse } from "@/types/api";

/**
 * GET /api/v1/projects
 * List projects with pagination and optional filters (all roles).
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const { searchParams } = new URL(req.url);

  const filters = {
    status: searchParams.get("status") || undefined,
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  };

  const result = await projectService.getProjects(organizationId, filters);

  return Response.json(
    createPaginatedResponse(result.data, result.total, result.page, result.limit)
  );
});

/**
 * POST /api/v1/projects
 * Create a new project (OWNER or ADMIN only).
 */
export const POST = withOrgScope(
  requireAdmin(async (req, { organizationId, session }) => {
    try {
      const body = await req.json();

      const parsed = createProjectSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      const project = await projectService.createProject(parsed.data, organizationId, session.id);

      return Response.json(createSuccessResponse(project), { status: 201 });
    } catch (error) {
      console.error("[POST /api/v1/projects]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
