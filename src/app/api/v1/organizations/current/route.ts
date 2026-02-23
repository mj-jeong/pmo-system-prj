// PMO System - Current Organization API Routes
// GET /api/v1/organizations/current - Get current organization
// PATCH /api/v1/organizations/current - Update current organization
// DELETE /api/v1/organizations/current - Soft-delete current organization (OWNER only)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireOwner } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { updateOrganizationSchema } from "@/lib/validators/organization";
import { organizationService } from "@/lib/domain/organization";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/organizations/current
 * Get the current user's organization.
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const organization = await organizationService.getOrganization(organizationId);

  if (!organization) {
    return createErrorResponse(ERROR_CODES.ORG_NOT_FOUND, "Organization not found.", 404);
  }

  return Response.json(createSuccessResponse(organization));
});

/**
 * PATCH /api/v1/organizations/current
 * Update the current organization (OWNER only).
 */
export const PATCH = withOrgScope(
  requireOwner(async (req, { organizationId, session }) => {
    const body = await req.json();

    const parsed = updateOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    // If slug is being changed, check availability
    if (parsed.data.slug) {
      const slugTaken = await organizationService.isSlugTaken(parsed.data.slug, organizationId);
      if (slugTaken) {
        return createErrorResponse(ERROR_CODES.ORG_SLUG_TAKEN, "Organization slug is already in use.", 409);
      }
    }

    const updated = await organizationService.updateOrganization(organizationId, session.id, parsed.data);

    return Response.json(createSuccessResponse(updated));
  })
);

/**
 * DELETE /api/v1/organizations/current
 * Soft-delete the current organization (OWNER only).
 */
export const DELETE = withOrgScope(
  requireOwner(async (req, { organizationId }) => {
    await organizationService.deleteOrganization(organizationId);
    return new Response(null, { status: 204 });
  })
);
