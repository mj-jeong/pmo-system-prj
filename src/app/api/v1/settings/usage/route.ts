// PMO System - LLM Usage API
// GET /api/v1/settings/usage
// Returns aggregated LLM token usage and cost estimates for the current organization.
// Requires ADMIN role or higher.

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

/**
 * GET /api/v1/settings/usage
 * Query params:
 *   year  — 4-digit year (default: current year)
 *   month — 1-12 month number (default: current month)
 *
 * Response:
 *   year            — the queried year
 *   month           — the queried month
 *   totalTokens     — sum of all tokens consumed in the period
 *   estimatedCostUsd — sum of all estimated costs (USD, 6 decimal places)
 *   reportCount     — number of distinct agent runs with LLM usage in the period
 *   usages          — array of individual LlmUsage records for the period
 */
export const GET = withOrgScope(
  requireAdmin(async (req, { organizationId }) => {
    try {
      const { searchParams } = new URL(req.url);

      // --- Parse year/month with sensible defaults ---
      const now = new Date();
      const rawYear = parseInt(searchParams.get("year") ?? String(now.getFullYear()), 10);
      const rawMonth = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1), 10);

      const year = Number.isFinite(rawYear) && rawYear > 2000 && rawYear < 2100 ? rawYear : now.getFullYear();
      const month = Number.isFinite(rawMonth) && rawMonth >= 1 && rawMonth <= 12 ? rawMonth : now.getMonth() + 1;

      // --- Build date range for the requested month ---
      // periodStart: first day of the month (UTC midnight)
      // periodEnd:   first day of the next month (UTC midnight), exclusive upper bound
      const periodStart = new Date(Date.UTC(year, month - 1, 1));
      const periodEnd = new Date(Date.UTC(year, month, 1));

      // --- Fetch all LlmUsage records for the period ---
      const usages = await prisma.llmUsage.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          agentRunId: true,
          model: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          estimatedCostUsd: true,
          createdAt: true,
        },
      });

      // --- Aggregate totals ---
      const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
      const rawCostSum = usages.reduce((sum, u) => sum + (u.estimatedCostUsd ?? 0), 0);
      const estimatedCostUsd = Math.round(rawCostSum * 1_000_000) / 1_000_000;

      // --- Count distinct agent runs ---
      const reportCount = new Set(usages.map((u) => u.agentRunId)).size;

      return Response.json(
        {
          success: true,
          data: {
            year,
            month,
            totalTokens,
            estimatedCostUsd,
            reportCount,
            usages,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[GET /api/v1/settings/usage]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "LLM 사용량 조회 중 오류가 발생했습니다.",
        500
      );
    }
  })
);
