// PMO System - Organization Scope Middleware
// Ensures all API operations are scoped to the current user's organization.
// This is the CRITICAL multi-tenancy enforcement layer.
//
// Usage:
//   export const GET = withOrgScope(async (req, { session, organizationId }) => {
//     // session.organizationId is guaranteed to be present
//   });

import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import type { SessionUser } from "@/types";

/**
 * Context provided to org-scoped route handlers.
 */
export interface OrgScopedContext {
  session: SessionUser;
  organizationId: string;
}

/**
 * Type for org-scoped route handler functions.
 */
type OrgScopedHandler = (
  req: NextRequest,
  context: OrgScopedContext
) => Promise<Response>;

/**
 * Wraps a route handler to enforce organization scope.
 *
 * - Validates the user's session
 * - Extracts organizationId from the session (never from request body/params)
 * - Passes the scoped context to the handler
 * - Returns 401 if no valid session
 *
 * IMPORTANT: organizationId must ALWAYS come from the authenticated session,
 * never from client-provided data. This prevents cross-organization access.
 */
export function withOrgScope(handler: OrgScopedHandler) {
  return async (req: NextRequest, routeContext?: any): Promise<Response> => {
    try {
      const session = await getCurrentUser();

      if (!session) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          "Authentication required.",
          401
        );
      }

      if (!session.organizationId) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          "No organization context in session.",
          401
        );
      }

      return handler(req, {
        session,
        organizationId: session.organizationId,
      });
    } catch (error) {
      console.error("[withOrgScope] Unexpected error:", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "An unexpected error occurred.",
        500
      );
    }
  };
}
