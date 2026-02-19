// PMO System - Agent Run Domain Service
// Business logic for agent run listing and retrieval.
// All queries MUST be scoped to organizationId for tenant isolation.

import { prisma } from "@/lib/db/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListRunsParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
}

// ---------------------------------------------------------------------------
// Agent Run Service
// ---------------------------------------------------------------------------

export const agentRunService = {
  /**
   * List agent runs with pagination and optional status filter.
   * Scoped to organization.
   */
  async listRuns(organizationId: string, params: ListRunsParams = {}) {
    const { page = 1, limit = 20, status } = params;

    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.agentRun.findMany({
        where,
        select: {
          id: true,
          status: true,
          inputParams: true,
          outputSummary: true,
          errorMessage: true,
          startedAt: true,
          finishedAt: true,
          reportId: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.agentRun.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get a single agent run by ID, scoped to organization.
   * Includes steps with nested tool calls for full trace observability.
   * Returns null if not found.
   */
  async getRun(organizationId: string, runId: string) {
    return prisma.agentRun.findFirst({
      where: {
        id: runId,
        organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        report: {
          select: {
            id: true,
            status: true,
            periodStart: true,
            periodEnd: true,
            createdAt: true,
          },
        },
        steps: {
          orderBy: { createdAt: "asc" },
          include: {
            toolCalls: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
  },

  /**
   * Check if there is a RUNNING agent run for this organization.
   * Used as a concurrency guard to prevent parallel runs.
   */
  async hasRunningRun(organizationId: string): Promise<boolean> {
    const count = await prisma.agentRun.count({
      where: {
        organizationId,
        status: "RUNNING",
      },
    });
    return count > 0;
  },
};
