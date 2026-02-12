// PMO System - Workforce Summary API Route
// GET /api/v1/dashboard/workforce - Workforce summary

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { dashboardService } from "@/lib/domain/dashboard";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/dashboard/workforce
 * Get workforce summary (present, absent, on-leave counts).
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || undefined;

  const summary = await dashboardService.getWorkforceSummary(organizationId, date);
  return Response.json(createSuccessResponse(summary));
});
