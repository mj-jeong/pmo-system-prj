// PMO System - Dashboard Summary API Route
// GET /api/v1/dashboard/summary - Dashboard metrics

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { dashboardService } from "@/lib/domain/dashboard";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/dashboard/summary
 * Get dashboard summary metrics (total projects, delayed, avg progress).
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const summary = await dashboardService.getDashboardSummary(organizationId);
  return Response.json(createSuccessResponse(summary));
});
