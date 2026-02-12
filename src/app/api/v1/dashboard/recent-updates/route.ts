// PMO System - Recent Updates API Route
// GET /api/v1/dashboard/recent-updates - Recent project updates

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { dashboardService } from "@/lib/domain/dashboard";
import { createSuccessResponse } from "@/types/api";

/**
 * GET /api/v1/dashboard/recent-updates
 * Get recent project updates across all projects in the organization.
 */
export const GET = withOrgScope(async (req, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;

  const updates = await dashboardService.getRecentUpdates(organizationId, limit);
  return Response.json(createSuccessResponse(updates));
});
