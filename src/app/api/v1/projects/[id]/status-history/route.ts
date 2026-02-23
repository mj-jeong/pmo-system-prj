// PMO System - Project Status History API
// GET /api/v1/projects/[id]/status-history
// Returns all status change records for a project in reverse-chronological order.
// Accessible by any authenticated member (MEMBER, ADMIN, OWNER).

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { prisma } from "@/lib/db/prisma";
import { createSuccessResponse } from "@/types/api";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

/**
 * Extract the project ID from the URL path.
 * Path pattern: /api/v1/projects/[id]/status-history
 */
function extractProjectId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const projectsIndex = segments.indexOf("projects");
  return projectsIndex >= 0 ? segments[projectsIndex + 1] || null : null;
}

/**
 * GET /api/v1/projects/[id]/status-history
 * Lists all status transitions for the specified project.
 * Enforces org-scope: the project must belong to the caller's organization.
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  try {
    const projectId = extractProjectId(req.url);
    if (!projectId) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Project ID is required.",
        400
      );
    }

    // Verify the project exists and belongs to this organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!project) {
      return createErrorResponse(
        ERROR_CODES.PROJECT_NOT_FOUND,
        "Project not found.",
        404
      );
    }

    const history = await prisma.projectStatusHistory.findMany({
      where: {
        projectId,
        organizationId,
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(createSuccessResponse(history), { status: 200 });
  } catch (error) {
    console.error("[GET /api/v1/projects/[id]/status-history]", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "예기치 않은 오류가 발생했습니다.",
      500
    );
  }
});
