// PMO System - Organization Settings API
// GET /api/v1/settings/organization - Read org working hours & report day (ADMIN+)
// PATCH /api/v1/settings/organization - Update org settings (OWNER only)

import { z } from "zod";
import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin, requireOwner } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createSuccessResponse } from "@/types/api";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { recordAudit } from "@/lib/domain/audit";

/**
 * Zod schema for PATCH /api/v1/settings/organization.
 * All fields are optional — only the provided fields are updated.
 */
const updateOrgSettingsSchema = z.object({
  workingHoursStart: z.number().int().min(0).max(23).optional(),
  workingHoursEnd: z.number().int().min(0).max(23).optional(),
  weeklyReportDay: z
    .enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])
    .optional(),
});

type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;

/**
 * GET /api/v1/settings/organization
 * Returns the organization's working hours and weekly report day.
 * Requires ADMIN role or higher.
 */
export const GET = withOrgScope(
  requireAdmin(async (_req, { organizationId }) => {
    try {
      const organization = await prisma.organization.findFirst({
        where: {
          id: organizationId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          weeklyReportDay: true,
          updatedAt: true,
        },
      });

      if (!organization) {
        return createErrorResponse(
          ERROR_CODES.ORG_NOT_FOUND,
          "Organization not found.",
          404
        );
      }

      return Response.json(createSuccessResponse(organization), { status: 200 });
    } catch (error) {
      console.error("[GET /api/v1/settings/organization]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "예기치 않은 오류가 발생했습니다.",
        500
      );
    }
  })
);

/**
 * PATCH /api/v1/settings/organization
 * Updates the organization's working hours and/or weekly report day.
 * Requires OWNER role (only owners can change org-level settings).
 */
export const PATCH = withOrgScope(
  requireOwner(async (req, { organizationId, session }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "Request body must be valid JSON.",
          400
        );
      }

      const parsed = updateOrgSettingsSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "유효하지 않은 입력입니다.",
          400,
          details
        );
      }

      const data: UpdateOrgSettingsInput = parsed.data;

      // Guard: at least one field must be provided
      if (Object.keys(data).length === 0) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "변경할 필드를 하나 이상 제공해야 합니다.",
          400
        );
      }

      const updated = await prisma.organization.update({
        where: { id: organizationId },
        data,
        select: {
          id: true,
          name: true,
          slug: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          weeklyReportDay: true,
          updatedAt: true,
        },
      });

      // Record audit log — failures must not block the response
      await recordAudit({
        organizationId,
        actorId: session.id,
        action: "ORG_SETTINGS_UPDATED",
        entityType: "Organization",
        entityId: organizationId,
        meta: { updatedFields: Object.keys(data) },
      });

      return Response.json(createSuccessResponse(updated), { status: 200 });
    } catch (error) {
      console.error("[PATCH /api/v1/settings/organization]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "예기치 않은 오류가 발생했습니다.",
        500
      );
    }
  })
);
