// PMO System - User Invite API Route
// POST /api/v1/users/invite - Invite member with role assignment (OWNER or ADMIN)

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { inviteUserSchema } from "@/lib/validators/user";
import { userService } from "@/lib/domain/user";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/users/invite
 * Invite a new member to the organization (OWNER or ADMIN).
 * ADMIN cannot invite with OWNER role.
 */
export const POST = withOrgScope(
  requireAdmin(async (req, { session, organizationId }) => {
    try {
      const body = await req.json();

      const parsed = inviteUserSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      const { email, name, password, role } = parsed.data;

      // ADMIN cannot assign OWNER role
      if (session.role === "ADMIN" && role === "ADMIN") {
        // ADMIN can assign ADMIN (but not OWNER - already blocked by schema)
        // This is fine per the permission matrix
      }

      // Check if email already exists in the organization
      const emailTaken = await userService.isEmailTaken(email, organizationId);
      if (emailTaken) {
        return createErrorResponse(ERROR_CODES.EMAIL_ALREADY_EXISTS, "Email already exists in this organization.", 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userService.inviteUser(
        { email, name, hashedPassword },
        role,
        organizationId
      );

      return Response.json(
        createSuccessResponse({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          organizationId: user.organizationId,
          createdAt: user.createdAt.toISOString(),
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("[POST /api/v1/users/invite]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
