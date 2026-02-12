// PMO System - User Attendance History API Route
// GET /api/v1/attendance/user/[userId] - Get specific user's attendance history (OWNER or ADMIN)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { userService } from "@/lib/domain/user";
import { attendanceService } from "@/lib/domain/attendance";
import { createPaginatedResponse } from "@/types/api";

/**
 * GET /api/v1/attendance/user/[userId]
 * Get a specific user's attendance history (OWNER or ADMIN).
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    // Extract userId from URL path
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const userIndex = segments.indexOf("user");
    const userId = userIndex >= 0 ? segments[userIndex + 1] || null : null;

    if (!userId) {
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "User ID is required.", 400);
    }

    // Verify user belongs to organization
    const userExists = await userService.verifyUserOrg(userId, organizationId);
    if (!userExists) {
      return createErrorResponse(ERROR_CODES.USER_NOT_FOUND, "User not found.", 404);
    }

    const { searchParams } = url;
    const filters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20,
    };

    const result = await attendanceService.getAttendanceByUser(userId, organizationId, filters);

    return Response.json(
      createPaginatedResponse(result.data, result.total, result.page, result.limit)
    );
  })
);
