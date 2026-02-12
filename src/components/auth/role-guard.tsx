"use client";

// PMO System - RoleGuard Component
// Conditionally renders children based on the current user's role.
// CRITICAL: Removes elements from DOM entirely (not CSS hidden).

import { useCurrentUser } from "@/hooks/use-current-user";
import type { RoleName } from "@/types";

const ROLE_LEVEL: Record<RoleName, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export interface RoleGuardProps {
  /** Required role or array of allowed roles */
  role: RoleName | RoleName[];
  /** Content to render when role check passes */
  children: React.ReactNode;
  /** Optional fallback content when role check fails (default: null) */
  fallback?: React.ReactNode;
}

/**
 * Conditionally render content based on the user's role.
 *
 * When `role` is a single value, it acts as a minimum role check:
 *   <RoleGuard role="ADMIN"> -- shows for ADMIN and OWNER
 *
 * When `role` is an array, it acts as an allowlist:
 *   <RoleGuard role={["OWNER", "ADMIN"]}> -- shows for OWNER and ADMIN only
 */
export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return null;
  }

  const hasAccess = Array.isArray(role)
    ? role.includes(user.role)
    : ROLE_LEVEL[user.role] >= ROLE_LEVEL[role];

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
