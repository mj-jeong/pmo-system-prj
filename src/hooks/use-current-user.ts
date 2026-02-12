// PMO System - useCurrentUser Hook
// Returns the current authenticated user with organization context and role.
// Wraps next-auth useSession with typed PMO session data.

"use client";

import { useSession } from "next-auth/react";
import type { RoleName } from "@/types";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: RoleName;
}

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const user: CurrentUser | null =
    session?.user && (session.user as any).id
      ? {
          id: (session.user as any).id,
          email: session.user.email ?? "",
          name: session.user.name ?? "",
          organizationId: (session.user as any).organizationId,
          role: (session.user as any).role as RoleName,
        }
      : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
