// PMO System - Audit Logs API
// GET /api/v1/settings/audit-logs
// Returns a paginated list of audit log entries for the current organization.
// Requires ADMIN role or higher.

import { z } from "zod";
import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createPaginatedResponse } from "@/types/api";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { AuditAction } from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/v1/settings/audit-logs
 * Query params:
 *   page       — 1-based page number (default: 1)
 *   limit      — records per page (default: 20, max: 100)
 *   action     — optional AuditAction enum filter
 *   entityType — optional entityType string filter
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      const { searchParams } = new URL(req.url);

      // --- Parse pagination params ---
      const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
      const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);

      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0
          ? Math.min(rawLimit, 100)
          : 20;

      const skip = (page - 1) * limit;

      // --- Optional filters (Zod runtime validation) ---
      const filterSchema = z.object({
        action: z.nativeEnum(AuditAction).optional(),
        entityType: z
          .string()
          .max(50)
          .regex(/^[a-zA-Z0-9_]+$/)
          .optional(),
      });

      const filterResult = filterSchema.safeParse({
        action: searchParams.get("action") ?? undefined,
        entityType: searchParams.get("entityType") ?? undefined,
      });

      if (!filterResult.success) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "유효하지 않은 필터 파라미터입니다.",
          400
        );
      }

      const { action, entityType } = filterResult.data;

      // Build the where clause
      const where: Prisma.AuditLogWhereInput = {
        organizationId,
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
      };

      // Run count and data queries in parallel
      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      return Response.json(
        createPaginatedResponse(logs, total, page, limit),
        { status: 200 }
      );
    } catch (error) {
      console.error("[GET /api/v1/settings/audit-logs]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "예기치 않은 오류가 발생했습니다.",
        500
      );
    }
  })
);
