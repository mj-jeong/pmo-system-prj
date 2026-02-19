// PMO System - Users API Routes
// GET /api/v1/users - List organization members with pagination (OWNER or ADMIN)

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { userService } from "@/lib/domain/user";
import { createPaginatedResponse } from "@/types/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * GET /api/v1/users
 * List members in the current organization with pagination (OWNER or ADMIN).
 * Query params: page (default: 1), limit (default: 20, max: 100)
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const rawLimit = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
    const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));

    const { users, total } = await userService.getUsersPaginated(organizationId, page, limit);

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

    return Response.json(createPaginatedResponse(safeUsers, total, page, limit));
  })
);
