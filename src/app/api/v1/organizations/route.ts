// PMO System - Organization API Routes
// POST /api/v1/organizations - Create organization (standalone, not via registration)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createOrganizationSchema } from "@/lib/validators/organization";
import { organizationService } from "@/lib/domain/organization";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/organizations
 * Create a new organization (admin operation).
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    const parsed = createOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    // Check slug availability
    const slugTaken = await organizationService.isSlugTaken(parsed.data.slug);
    if (slugTaken) {
      return createErrorResponse(ERROR_CODES.ORG_SLUG_TAKEN, "Organization slug is already in use.", 409);
    }

    const organization = await organizationService.createOrganization(parsed.data);

    return Response.json(createSuccessResponse(organization), { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/organizations]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
}
