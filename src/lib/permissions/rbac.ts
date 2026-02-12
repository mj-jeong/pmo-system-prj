// PMO System - Role-Based Access Control
// Enforces 3-tier role checks (OWNER > ADMIN > MEMBER) on API route handlers.
//
// Usage:
//   export const DELETE = withOrgScope(
//     requireRole("OWNER", async (req, ctx) => {
//       // Only OWNER can reach this handler
//     })
//   );

import type { RoleName, SessionUser } from "@/types";
import { NextRequest } from "next/server";
import type { OrgScopedContext } from "./organization-scope";

/**
 * Role hierarchy levels.
 * OWNER (3) > ADMIN (2) > MEMBER (1)
 */
const ROLE_HIERARCHY: Record<RoleName, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

/**
 * Permission matrix defining what each role can do.
 *
 * OWNER: Full organization management, delete organization, financial settings
 * ADMIN: Member management, attendance monitoring, project oversight (no org deletion)
 * MEMBER: Self-service only (own attendance, assigned projects)
 */
export const ROLE_PERMISSIONS = {
  OWNER: {
    organization: { create: true, read: true, update: true, delete: true },
    project: { create: true, read: true, update: true, delete: true },
    projectUpdate: { create: true, read: true, update: true, delete: true },
    attendance: { create: true, read: true, update: true, delete: false },
    timeOff: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: true,
      reject: true,
    },
    user: {
      create: true,
      read: true,
      update: true,
      delete: true,
      invite: true,
      assignRole: true,
    },
  },
  ADMIN: {
    organization: { create: false, read: true, update: false, delete: false },
    project: { create: true, read: true, update: true, delete: true },
    projectUpdate: { create: true, read: true, update: true, delete: false },
    attendance: { create: true, read: true, update: true, delete: false },
    timeOff: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: true,
      reject: true,
    },
    user: {
      create: true,
      read: true,
      update: false,
      delete: true,
      invite: true,
      assignRole: false,
    },
  },
  MEMBER: {
    organization: { create: false, read: true, update: false, delete: false },
    project: { create: false, read: true, update: false, delete: false },
    projectUpdate: { create: true, read: true, update: false, delete: false },
    attendance: { create: true, read: true, update: false, delete: false },
    timeOff: {
      create: true,
      read: true,
      update: false,
      delete: false,
      approve: false,
      reject: false,
    },
    user: {
      create: false,
      read: true,
      update: false,
      delete: false,
      invite: false,
      assignRole: false,
    },
  },
} as const;

/**
 * Middleware that enforces a minimum role requirement.
 * Returns 403 if the user's role does not meet the requirement.
 *
 * Role hierarchy: OWNER (3) > ADMIN (2) > MEMBER (1)
 * requireRole("ADMIN") allows OWNER and ADMIN, blocks MEMBER.
 */
export function requireRole(
  requiredRole: RoleName,
  handler: (req: NextRequest, ctx: OrgScopedContext) => Promise<Response>
) {
  return async (req: NextRequest, ctx: OrgScopedContext): Promise<Response> => {
    const userLevel = ROLE_HIERARCHY[ctx.session.role];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];

    if (userLevel < requiredLevel) {
      return Response.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_ROLE",
            message: `This action requires ${requiredRole} role or higher.`,
          },
        },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  };
}

/**
 * Shorthand: require OWNER role.
 */
export function requireOwner(
  handler: (req: NextRequest, ctx: OrgScopedContext) => Promise<Response>
) {
  return requireRole("OWNER", handler);
}

/**
 * Shorthand: require ADMIN role or higher (allows OWNER and ADMIN, blocks MEMBER).
 */
export function requireAdmin(
  handler: (req: NextRequest, ctx: OrgScopedContext) => Promise<Response>
) {
  return requireRole("ADMIN", handler);
}

/**
 * Alias for requireAdmin - allows OWNER or ADMIN.
 */
export const requireOwnerOrAdmin = requireAdmin;

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  role: RoleName,
  resource: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  const resourcePerms = permissions[resource as keyof typeof permissions];
  if (!resourcePerms) return false;
  return (resourcePerms as Record<string, boolean>)[action] ?? false;
}
