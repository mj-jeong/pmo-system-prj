// PMO System - Attendance List API Route
// GET /api/v1/attendance - List all attendance with filters (OWNER or ADMIN)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { attendanceQuerySchema } from "@/lib/validators/attendance";
import { attendanceService } from "@/lib/domain/attendance";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createPaginatedResponse } from "@/types/api";

/**
 * GET /api/v1/attendance
 * List all attendance records with filters (OWNER or ADMIN).
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    const { searchParams } = new URL(req.url);

    const rawFilters = {
      userId: searchParams.get("userId") || undefined,
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parsed = attendanceQuerySchema.safeParse(rawFilters);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid query parameters.", 400, details);
    }

    const result = await attendanceService.getAttendance(organizationId, parsed.data);

    return Response.json(
      createPaginatedResponse(result.data, result.total, result.page, result.limit)
    );
  })
);
