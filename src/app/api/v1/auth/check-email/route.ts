// PMO System - Email Availability Check API
// GET /api/v1/auth/check-email?email=xxx&organizationSlug=yyy
// Public endpoint — no authentication required.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/auth/check-email
 * Check if an email is available within an organization scope.
 *
 * Query params:
 *   email            - email address to check
 *   organizationSlug - org slug (for "Create New Org" flow) OR
 *   organizationId   - org id (for "Join Existing Org" flow)
 *
 * Response: { success: true, data: { available: boolean } }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get("email")?.trim().toLowerCase();
  const organizationSlug = searchParams.get("organizationSlug")?.trim();
  const organizationId = searchParams.get("organizationId")?.trim();

  if (!email) {
    return Response.json(
      createSuccessResponse({ available: true }),
      { status: 200 }
    );
  }

  try {
    // Check by organizationId directly (Join Org flow)
    if (organizationId) {
      const existing = await prisma.user.findFirst({
        where: { email, organizationId, deletedAt: null },
        select: { id: true },
      });
      return Response.json(
        createSuccessResponse({ available: !existing }),
        { status: 200 }
      );
    }

    // Check by organizationSlug (Create New Org flow)
    if (organizationSlug) {
      const org = await prisma.organization.findUnique({
        where: { slug: organizationSlug, deletedAt: null },
        select: { id: true },
      });

      // If org doesn't exist yet, the email is definitely available
      if (!org) {
        return Response.json(
          createSuccessResponse({ available: true }),
          { status: 200 }
        );
      }

      const existing = await prisma.user.findFirst({
        where: { email, organizationId: org.id, deletedAt: null },
        select: { id: true },
      });
      return Response.json(
        createSuccessResponse({ available: !existing }),
        { status: 200 }
      );
    }

    // No org context — always available
    return Response.json(
      createSuccessResponse({ available: true }),
      { status: 200 }
    );
  } catch {
    // Fail silently — don't block UX on check failure
    return Response.json(
      createSuccessResponse({ available: true }),
      { status: 200 }
    );
  }
}
