// PMO System - Agent Run Detail API Route
// GET /api/v1/agent/runs/[id] - Get agent run detail with steps and tool calls

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { agentRunIdSchema } from "@/lib/validators/report";
import { agentRunService } from "@/lib/domain/agent-run";
import { createSuccessResponse } from "@/types/api";

/**
 * Extract run ID from URL path.
 */
function extractRunId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const runsIndex = segments.indexOf("runs");
  return runsIndex >= 0 ? segments[runsIndex + 1] || null : null;
}

/**
 * GET /api/v1/agent/runs/[id]
 * Get a single agent run with full step and tool call trace.
 * Requires ADMIN role or higher.
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      const runId = extractRunId(req.url);
      if (!runId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Agent run ID is required.", 400);
      }

      // Validate ID format
      const idParsed = agentRunIdSchema.safeParse({ id: runId });
      if (!idParsed.success) {
        const details = idParsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid agent run ID.", 400, details);
      }

      const run = await agentRunService.getRun(organizationId, idParsed.data.id);

      if (!run) {
        return createErrorResponse(ERROR_CODES.AGENT_RUN_NOT_FOUND, "Agent run not found.", 404);
      }

      return Response.json(createSuccessResponse(run));
    } catch (error) {
      console.error("[GET /api/v1/agent/runs/[id]]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
