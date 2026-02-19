// PMO System - Agent Generate API Route
// POST /api/v1/agent/generate - Trigger a new PMO report generation run

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { generateReportSchema } from "@/lib/validators/agent";
import { agentRunService } from "@/lib/domain/agent-run";
import { executeRun } from "@/lib/domain/agent-orchestrator";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/agent/generate
 * Trigger a new PMO report generation run.
 * Requires ADMIN role or higher.
 *
 * Concurrency guard: Returns 409 if a run is already RUNNING for this organization.
 */
export const POST = withOrgScope(
  requireAdmin(async (req, { organizationId, session }) => {
    try {
      const body = await req.json();

      // Validate request body
      const parsed = generateReportSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
      }

      // Concurrency guard: check no RUNNING run exists
      const hasRunning = await agentRunService.hasRunningRun(organizationId);
      if (hasRunning) {
        return createErrorResponse(
          ERROR_CODES.AGENT_RUN_ALREADY_RUNNING,
          "An agent run is already in progress for this organization.",
          409
        );
      }

      // Execute the agent pipeline
      const result = await executeRun(organizationId, session.id, parsed.data);

      if (result.status === "FAILED") {
        // Determine appropriate error code based on error message
        const errorMessage = result.errorMessage || "Agent run failed.";
        const isOpenAiError =
          errorMessage.toLowerCase().includes("openai") ||
          errorMessage.toLowerCase().includes("rate limit");

        if (isOpenAiError && errorMessage.toLowerCase().includes("rate limit")) {
          return createErrorResponse(ERROR_CODES.OPENAI_RATE_LIMITED, errorMessage, 503);
        }
        if (isOpenAiError) {
          return createErrorResponse(ERROR_CODES.OPENAI_API_ERROR, errorMessage, 502);
        }
        return createErrorResponse(ERROR_CODES.AGENT_RUN_FAILED, errorMessage, 500);
      }

      return Response.json(
        createSuccessResponse({
          runId: result.runId,
          reportId: result.reportId,
          status: result.status,
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("[POST /api/v1/agent/generate]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
