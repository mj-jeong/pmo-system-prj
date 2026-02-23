// PMO System - Agent Run Retry API Route
// POST /api/v1/agent/runs/[id]/retry
// FAILED 상태의 AgentRun을 동일한 inputParams로 재시도합니다.

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { prisma } from "@/lib/db/prisma";
import { executeRun } from "@/lib/domain/agent-orchestrator";
import { createSuccessResponse } from "@/types/api";

/**
 * Extract run ID from URL path.
 * /api/v1/agent/runs/[id]/retry -> [id]
 */
function extractRunId(url: string): string | null {
  const segments = new URL(url).pathname.split("/");
  const runsIndex = segments.indexOf("runs");
  return runsIndex >= 0 ? segments[runsIndex + 1] || null : null;
}

/**
 * POST /api/v1/agent/runs/[id]/retry
 *
 * FAILED AgentRun을 재시도합니다.
 * - 원본 run의 inputParams를 그대로 사용
 * - retryCount = 원본.retryCount + 1
 * - parentRunId = 원본 run ID
 * - 재시도는 동기 실행 (백그라운드 처리 없음)
 *
 * 응답: { runId, reportId, status }
 */
export const POST = withOrgScope(
  requireAdmin(async (req, { organizationId, session }) => {
    try {
      const runId = extractRunId(req.url);
      if (!runId) {
        return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Run ID is required.", 400);
      }

      // 원본 AgentRun 조회 (org 격리)
      const originalRun = await prisma.agentRun.findFirst({
        where: {
          id: runId,
          organizationId,
        },
      });

      if (!originalRun) {
        return createErrorResponse(ERROR_CODES.AGENT_RUN_NOT_FOUND, "Agent run not found.", 404);
      }

      // FAILED 상태인 경우만 재시도 허용
      if (originalRun.status !== "FAILED") {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          `Agent run cannot be retried: current status is ${originalRun.status}. Only FAILED runs can be retried.`,
          409
        );
      }

      // inputParams JSON → GenerateReportInput 변환
      const params = originalRun.inputParams as {
        periodStart: string;
        periodEnd: string;
        projectIds: string[];
        detailLevel: "BRIEF" | "STANDARD" | "DETAILED";
      };

      if (!params.periodStart || !params.periodEnd || !Array.isArray(params.projectIds)) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          "Original run has invalid input parameters.",
          422
        );
      }

      const input = {
        periodStart: new Date(params.periodStart),
        periodEnd: new Date(params.periodEnd),
        projectIds: params.projectIds,
        detailLevel: params.detailLevel ?? "STANDARD",
      };

      // 재시도 실행 (새 AgentRun 생성 후 동기 실행)
      const result = await executeRun(organizationId, session.id, input, {
        parentRunId: originalRun.id,
        retryCount: (originalRun.retryCount ?? 0) + 1,
      });

      return Response.json(createSuccessResponse(result));
    } catch (error) {
      console.error("[POST /api/v1/agent/runs/[id]/retry]", error);
      return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
    }
  })
);
