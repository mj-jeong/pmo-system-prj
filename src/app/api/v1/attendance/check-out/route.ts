// PMO System - Attendance Check-out API Route
// POST /api/v1/attendance/check-out - Record check-out (server timestamp)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { attendanceService } from "@/lib/domain/attendance";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/attendance/check-out
 * Record check-out timestamp (server-generated, never client-provided).
 * Any authenticated user can check out.
 */
export const POST = withOrgScope(async (req, { session, organizationId }) => {
  try {
    const result = await attendanceService.checkOut(session.id, organizationId);

    if ("error" in result) {
      if (result.error === "NOT_CHECKED_IN") {
        return createErrorResponse(
          ERROR_CODES.ATTENDANCE_NOT_FOUND,
          "Must check in before checking out.",
          400
        );
      }
      if (result.error === "ALREADY_CHECKED_OUT") {
        return createErrorResponse(
          ERROR_CODES.ATTENDANCE_ALREADY_LOGGED,
          "Already checked out today.",
          409
        );
      }
    }

    return Response.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error("[POST /api/v1/attendance/check-out]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
});
