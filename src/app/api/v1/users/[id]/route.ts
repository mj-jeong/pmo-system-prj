// PMO System - Individual User API Route
// DELETE /api/v1/users/[id] - Remove member (OWNER or ADMIN)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { userService } from "@/lib/domain/user";

/**
 * DELETE /api/v1/users/[id]
 * Soft-delete a member from the organization (OWNER or ADMIN).
 * Cannot delete yourself.
 */
export const DELETE = withOrgScope(
  requireAdmin(async (req, { session, organizationId }) => {
    try {
      // Extract userId from URL path
      const url = new URL(req.url);
      const segments = url.pathname.split("/");
      const userIdIndex = segments.indexOf("users") + 1;
      const userId = segments[userIdIndex];

      if (!userId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "User ID is required.", 400);
      }

      // Prevent deleting yourself
      if (userId === session.id) {
        return createErrorResponse(ERROR_CODES.FORBIDDEN, "Cannot remove yourself.", 403);
      }

      // Verify user belongs to organization
      const user = await userService.getUserById(userId, organizationId);
      if (!user) {
        return createErrorResponse(ERROR_CODES.USER_NOT_FOUND, "User not found.", 404);
      }

      // ADMIN cannot remove OWNER or other ADMIN
      if (session.role === "ADMIN" && (user.role.name === "OWNER" || user.role.name === "ADMIN")) {
        return createErrorResponse(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "Admins cannot remove owners or other admins.",
          403
        );
      }

      await userService.removeUser(userId, organizationId);

      return new Response(null, { status: 204 });
    } catch (error) {
      console.error("[DELETE /api/v1/users/[id]]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
