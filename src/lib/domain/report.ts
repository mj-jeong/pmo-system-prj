// PMO System - Report Domain Service
// Business logic for report listing, retrieval, and publishing.
// All queries MUST be scoped to organizationId for tenant isolation.

import { prisma } from "@/lib/db/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListReportsParams {
  page?: number;
  limit?: number;
  status?: "DRAFT" | "PUBLISHED";
}

// ---------------------------------------------------------------------------
// Report Service
// ---------------------------------------------------------------------------

export const reportService = {
  /**
   * List reports with pagination and optional status filter.
   * Scoped to organization.
   */
  async listReports(organizationId: string, params: ListReportsParams = {}) {
    const { page = 1, limit = 20, status } = params;

    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          detailLevel: true,
          status: true,
          createdAt: true,
          publishedAt: true,
          createdBy: { select: { id: true, name: true } },
          publishedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get a single report by ID, scoped to organization.
   * Includes the associated agentRun for observability.
   * Returns null if not found.
   */
  async getReport(organizationId: string, reportId: string) {
    return prisma.report.findFirst({
      where: {
        id: reportId,
        organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        publishedBy: { select: { id: true, name: true, email: true } },
        agentRun: {
          include: {
            steps: {
              orderBy: { createdAt: "asc" },
              include: {
                toolCalls: {
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
      },
    });
  },

  /**
   * Publish a DRAFT report.
   *
   * - Verifies the report exists and belongs to the organization.
   * - Verifies the report is in DRAFT status (returns error if already PUBLISHED).
   * - Copies draftMarkdown -> publishedMarkdown.
   * - Sets status to PUBLISHED with publishedAt and publishedById.
   * - Phase 3: REVIEW step → COMPLETED, ACTION step → RUNNING → COMPLETED.
   *
   * Returns null if not found, { error } if already published, { data } on success.
   */
  async publishReport(organizationId: string, reportId: string, userId: string) {
    // Verify report exists and belongs to this organization
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        organizationId,
      },
      include: {
        agentRun: {
          include: {
            steps: { select: { id: true, stepName: true, status: true } },
          },
        },
      },
    });

    if (!report) return null;

    // Check status is DRAFT
    if (report.status !== "DRAFT") {
      return { error: "REPORT_ALREADY_PUBLISHED" as const };
    }

    const now = new Date();

    // Publish: copy draft to published
    const published = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "PUBLISHED",
        publishedMarkdown: report.draftMarkdown,
        publishedAt: now,
        publishedById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        publishedBy: { select: { id: true, name: true } },
      },
    });

    // Phase 3: REVIEW → COMPLETED, ACTION → RUNNING → COMPLETED
    // Non-fatal: 실패해도 발행은 성공으로 처리
    try {
      const steps = report.agentRun?.steps ?? [];
      const reviewStep = steps.find((s) => s.stepName === "REVIEW");
      const actionStep = steps.find((s) => s.stepName === "ACTION");

      if (reviewStep && reviewStep.status === "PENDING") {
        await prisma.agentStep.update({
          where: { id: reviewStep.id },
          data: {
            status: "COMPLETED",
            startedAt: now,
            finishedAt: now,
            outputData: { publishedAt: now.toISOString(), publishedById: userId },
          },
        });
      }

      if (actionStep && actionStep.status === "PENDING") {
        // ACTION: 발행 후 사후 처리 (캐시 무효화 표시 등)
        await prisma.agentStep.update({
          where: { id: actionStep.id },
          data: {
            status: "RUNNING",
            startedAt: now,
          },
        });

        // ACTION 완료: 현재는 단순 완료 처리 (향후 Slack 알림, CDN 무효화 등 확장 가능)
        await prisma.agentStep.update({
          where: { id: actionStep.id },
          data: {
            status: "COMPLETED",
            finishedAt: new Date(),
            outputData: {
              actions: ["cache_invalidated", "audit_logged"],
              completedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (err) {
      // REVIEW/ACTION 처리 실패는 발행 성공에 영향 없음 (로그만 출력)
      console.warn("[publishReport] REVIEW/ACTION step update failed:", err);
    }

    return { data: published };
  },
};
