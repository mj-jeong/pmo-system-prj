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
    });

    if (!report) return null;

    // Check status is DRAFT
    if (report.status !== "DRAFT") {
      return { error: "REPORT_ALREADY_PUBLISHED" as const };
    }

    // Publish: copy draft to published
    const published = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "PUBLISHED",
        publishedMarkdown: report.draftMarkdown,
        publishedAt: new Date(),
        publishedById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        publishedBy: { select: { id: true, name: true } },
      },
    });

    return { data: published };
  },
};
