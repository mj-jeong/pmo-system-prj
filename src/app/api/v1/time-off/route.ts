// PMO System - Time-Off API Routes
// GET /api/v1/time-off - List time-off requests
// POST /api/v1/time-off - Request time off

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createTimeOffSchema } from "@/lib/validators/time-off";
import { timeOffService } from "@/lib/domain/time-off";
import { createSuccessResponse, createPaginatedResponse } from "@/types/api";

/**
 * GET /api/v1/time-off
 * List time-off requests.
 * ADMIN/OWNER: see all org requests. MEMBER: see only own requests.
 */
export const GET = withOrgScope(async (req, { session, organizationId }) => {
  const { searchParams } = new URL(req.url);

  const filters: any = {
    status: searchParams.get("status") || undefined,
    type: searchParams.get("type") || undefined,
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20,
  };

  // MEMBER can only see their own requests
  if (session.role === "MEMBER") {
    filters.userId = session.id;
  } else {
    // ADMIN/OWNER can filter by userId optionally
    const userId = searchParams.get("userId");
    if (userId) filters.userId = userId;
  }

  const result = await timeOffService.getTimeOffs(organizationId, filters);

  return Response.json(
    createPaginatedResponse(result.data, result.total, result.page, result.limit)
  );
});

/**
 * POST /api/v1/time-off
 * Create a new time-off request (any authenticated user).
 */
export const POST = withOrgScope(async (req, { session, organizationId }) => {
  try {
    const body = await req.json();

    const parsed = createTimeOffSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    // Validate startDate <= endDate
    if (parsed.data.startDate > parsed.data.endDate) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Start date must be before or equal to end date.",
        400
      );
    }

    const timeOff = await timeOffService.requestTimeOff(parsed.data, session.id, organizationId);

    return Response.json(createSuccessResponse(timeOff), { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/time-off]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
});
