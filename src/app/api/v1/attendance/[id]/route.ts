// PMO System - Attendance Correction API Route
// PATCH /api/v1/attendance/[id] - Manual correction (OWNER or ADMIN)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { updateAttendanceSchema } from "@/lib/validators/attendance";
import { attendanceService } from "@/lib/domain/attendance";
import { createSuccessResponse } from "@/types/api";

/**
 * PATCH /api/v1/attendance/[id]
 * Manual correction of an attendance record (OWNER or ADMIN).
 */
export const PATCH = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      // Extract attendance ID from URL path
      const url = new URL(req.url);
      const segments = url.pathname.split("/");
      const attendanceIndex = segments.indexOf("attendance");
      const attendanceId = attendanceIndex >= 0 ? segments[attendanceIndex + 1] || null : null;

      if (!attendanceId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Attendance ID is required.", 400);
      }

      const body = await req.json();

      const parsed = updateAttendanceSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      const updated = await attendanceService.updateAttendance(attendanceId, organizationId, parsed.data);

      if (!updated) {
        return createErrorResponse(ERROR_CODES.ATTENDANCE_NOT_FOUND, "Attendance record not found.", 404);
      }

      return Response.json(createSuccessResponse(updated));
    } catch (error) {
      console.error("[PATCH /api/v1/attendance/[id]]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
