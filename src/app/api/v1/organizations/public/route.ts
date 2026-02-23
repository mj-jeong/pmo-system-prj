// PMO System - Public Organizations List
// GET /api/v1/organizations/public
// Public endpoint — returns minimal org info for "Join Org" dropdown.

import { prisma } from "@/lib/db/prisma";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/organizations/public
 * Returns a list of active organizations (id, name, slug only).
 * Used to populate the organization dropdown on the register page.
 */
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    return Response.json(createSuccessResponse(organizations), { status: 200 });
  } catch {
    return Response.json(createSuccessResponse([]), { status: 200 });
  }
}
