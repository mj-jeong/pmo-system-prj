// PMO System - Attendance Check-in API Route
// POST /api/v1/attendance/check-in - Record check-in (server timestamp)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { attendanceService } from "@/lib/domain/attendance";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/attendance/check-in
 * Record check-in timestamp (server-generated, never client-provided).
 * Any authenticated user can check in.
 */
export const POST = withOrgScope(async (req, { session, organizationId }) => {
  try {
    const result = await attendanceService.checkIn(session.id, organizationId);

    if ("error" in result) {
      if (result.error === "ALREADY_CHECKED_IN") {
        return createErrorResponse(
          ERROR_CODES.ATTENDANCE_ALREADY_LOGGED,
          "Already checked in today.",
          409
        );
      }
    }

    return Response.json(createSuccessResponse(result.data), { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/attendance/check-in]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
});
