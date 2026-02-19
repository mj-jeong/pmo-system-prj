// PMO System - Reports List API Route
// GET /api/v1/reports - List reports with pagination and filters

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { reportQuerySchema } from "@/lib/validators/report";
import { reportService } from "@/lib/domain/report";
import { createPaginatedResponse } from "@/types/api";

/**
 * GET /api/v1/reports
 * List reports with pagination and optional status filter.
 * Requires ADMIN role or higher.
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      const { searchParams } = new URL(req.url);

      // Parse and validate query parameters
      const queryParsed = reportQuerySchema.safeParse({
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      });

      if (!queryParsed.success) {
        const details = queryParsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid query parameters.", 400, details);
      }

      const result = await reportService.listReports(organizationId, queryParsed.data);

      return Response.json(
        createPaginatedResponse(result.data, result.total, result.page, result.limit)
      );
    } catch (error) {
      console.error("[GET /api/v1/reports]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
