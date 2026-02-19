// PMO System - Report Publish API Route
// POST /api/v1/reports/[id]/publish - Publish a DRAFT report

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { reportIdSchema } from "@/lib/validators/report";
import { reportService } from "@/lib/domain/report";
import { createSuccessResponse } from "@/types/api";

/**
 * Extract report ID from URL path.
 */
function extractReportId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const reportsIndex = segments.indexOf("reports");
  return reportsIndex >= 0 ? segments[reportsIndex + 1] || null : null;
}

/**
 * POST /api/v1/reports/[id]/publish
 * Publish a DRAFT report. Returns 409 if already published.
 * Requires ADMIN role or higher.
 */
export const POST = withOrgScope(
  requireAdmin(async (req, { organizationId, session }) => {
    try {
      const reportId = extractReportId(req.url);
      if (!reportId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Report ID is required.", 400);
      }

      // Validate ID format
      const idParsed = reportIdSchema.safeParse({ id: reportId });
      if (!idParsed.success) {
        const details = idParsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid report ID.", 400, details);
      }

      const result = await reportService.publishReport(
        organizationId,
        idParsed.data.id,
        session.id
      );

      // Not found
      if (result === null) {
        return createErrorResponse(ERROR_CODES.REPORT_NOT_FOUND, "Report not found.", 404);
      }

      // Already published (conflict)
      if ("error" in result) {
        return createErrorResponse(
          ERROR_CODES.REPORT_ALREADY_PUBLISHED,
          "Report is already published.",
          409
        );
      }

      return Response.json(createSuccessResponse(result.data));
    } catch (error) {
      console.error("[POST /api/v1/reports/[id]/publish]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
