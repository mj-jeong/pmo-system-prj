// PMO System - Today's Attendance API Route
// GET /api/v1/attendance/today - Get today's attendance for current user

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { attendanceService } from "@/lib/domain/attendance";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/attendance/today
 * Get today's attendance record for the current user.
 * Any authenticated user can access this.
 */
export const GET = withOrgScope(async (req, { session, organizationId }) => {
  const attendance = await attendanceService.getTodayAttendance(session.id, organizationId);

  return Response.json(createSuccessResponse(attendance));
});
