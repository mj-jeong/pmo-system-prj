// PMO System - User Role Change API Route
// PATCH /api/v1/users/[id]/role - Change user's role (OWNER only)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireOwner } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { changeRoleSchema } from "@/lib/validators/user";
import { userService } from "@/lib/domain/user";
import { createSuccessResponse } from "@/types/api";

/**
 * PATCH /api/v1/users/[id]/role
 * Change a user's role (OWNER only).
 */
export const PATCH = withOrgScope(
  requireOwner(async (req, { session, organizationId }) => {
    try {
      // Extract userId from URL path
      const url = new URL(req.url);
      const segments = url.pathname.split("/");
      // Path: /api/v1/users/[id]/role
      const userIdIndex = segments.indexOf("users") + 1;
      const userId = segments[userIdIndex];

      if (!userId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "User ID is required.", 400);
      }

      // Prevent changing own role
      if (userId === session.id) {
        return createErrorResponse(ERROR_CODES.FORBIDDEN, "Cannot change your own role.", 403);
      }

      const body = await req.json();

      const parsed = changeRoleSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      // Verify user belongs to organization
      const userExists = await userService.verifyUserOrg(userId, organizationId);
      if (!userExists) {
        return createErrorResponse(ERROR_CODES.USER_NOT_FOUND, "User not found.", 404);
      }

      const updated = await userService.changeRole(userId, parsed.data.role, organizationId);

      return Response.json(
        createSuccessResponse({
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role.name,
          organizationId: updated.organizationId,
        })
      );
    } catch (error) {
      console.error("[PATCH /api/v1/users/[id]/role]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
