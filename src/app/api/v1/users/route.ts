// PMO System - Users API Routes
// GET /api/v1/users - List organization members (OWNER or ADMIN)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { userService } from "@/lib/domain/user";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/users
 * List all members in the current organization (OWNER or ADMIN).
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    const users = await userService.getUsers(organizationId);

    // Map to safe response shape (exclude hashedPassword)
    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role.name,
      organizationId: u.organizationId,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return Response.json(createSuccessResponse(safeUsers));
  })
);
