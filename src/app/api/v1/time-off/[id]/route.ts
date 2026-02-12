// PMO System - Individual Time-Off API Route
// PATCH /api/v1/time-off/[id] - Update time-off request

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { updateTimeOffSchema } from "@/lib/validators/time-off";
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
 * PATCH /api/v1/time-off/[id]
 * Update a time-off request (only if PENDING, only own request for MEMBER).
 */
export const PATCH = withOrgScope(async (req, { session, organizationId }) => {
  try {
    const timeOffId = extractTimeOffId(req.url);
    if (!timeOffId) {
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Time-off ID is required.", 400);
    }

    // If MEMBER, verify it is their own request
    if (session.role === "MEMBER") {
      const existing = await timeOffService.getTimeOffById(timeOffId, organizationId);
      if (!existing || existing.userId !== session.id) {
        return createErrorResponse(ERROR_CODES.FORBIDDEN, "You can only update your own requests.", 403);
      }
    }

    const body = await req.json();

    const parsed = updateTimeOffSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    const result = await timeOffService.updateTimeOff(timeOffId, organizationId, parsed.data);

    if (result === null) {
      return createErrorResponse(ERROR_CODES.TIME_OFF_NOT_FOUND, "Time-off request not found.", 404);
    }

    if ("error" in result) {
      return createErrorResponse(ERROR_CODES.FORBIDDEN, "Cannot update a non-pending request.", 403);
    }

    return Response.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error("[PATCH /api/v1/time-off/[id]]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
});
