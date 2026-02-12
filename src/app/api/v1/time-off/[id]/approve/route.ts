// PMO System - Time-Off Approve API Route
// PATCH /api/v1/time-off/[id]/approve - Approve time-off request (OWNER or ADMIN)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { timeOffService } from "@/lib/domain/time-off";
import { createSuccessResponse } from "@/types/api";

/**
 * Extract time-off ID from URL path.
 */
function extractTimeOffId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const timeOffIndex = segments.indexOf("time-off");
  return timeOffIndex >= 0 ? segments[timeOffIndex + 1] || null : null;
}

/**
 * PATCH /api/v1/time-off/[id]/approve
 * Approve a time-off request (OWNER or ADMIN).
 */
export const PATCH = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      const timeOffId = extractTimeOffId(req.url);
      if (!timeOffId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Time-off ID is required.", 400);
      }

      const result = await timeOffService.approveTimeOff(timeOffId, organizationId);

      if (result === null) {
        return createErrorResponse(ERROR_CODES.TIME_OFF_NOT_FOUND, "Time-off request not found.", 404);
      }

      if ("error" in result) {
        return createErrorResponse(ERROR_CODES.FORBIDDEN, "Can only approve pending requests.", 403);
      }

      return Response.json(createSuccessResponse(result.data));
    } catch (error) {
      console.error("[PATCH /api/v1/time-off/[id]/approve]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
