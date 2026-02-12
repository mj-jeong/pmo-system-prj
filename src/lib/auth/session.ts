// PMO System - Session Helpers
// Provides typed session access with organizationId and role.
// Used by withOrgScope middleware and route handlers.

import { getServerSession } from "next-auth";

import { authOptions } from "./auth-options";
import type { SessionUser } from "@/types";

/**
 * Get the current authenticated user from the NextAuth session.
 * Returns null if not authenticated.
 *
 * Session structure:
 *   { id, email, name, organizationId, role: 'OWNER'|'ADMIN'|'MEMBER' }
 *
 * IMPORTANT: organizationId comes from the database via session callback,
 * never from client-provided data.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;

  // Verify that session contains required multi-tenancy fields
  if (!user.id || !user.organizationId || !user.role) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    name: user.name || "",
    organizationId: user.organizationId,
    role: user.role,
  };
}
