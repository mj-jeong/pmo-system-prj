// PMO System - Membership Requests List API
// GET /api/v1/settings/membership-requests
// Requires ADMIN or OWNER role.

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createSuccessResponse } from "@/types/api";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

/**
 * GET /api/v1/settings/membership-requests
 * List all membership requests for the current organization.
 * Returns PENDING requests first, then by creation date.
 */
export const GET = withOrgScope(
  requireAdmin(async (_req, { organizationId }) => {
    try {
      const requests = await prisma.membershipRequest.findMany({
        where: { organizationId },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          message: true,
          reviewedBy: true,
          reviewedAt: true,
          createdAt: true,
        },
      });

      return Response.json(createSuccessResponse(requests), { status: 200 });
    } catch (error) {
      console.error("[GET /api/v1/settings/membership-requests]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "예기치 않은 오류가 발생했습니다.",
        500
      );
    }
  })
);
