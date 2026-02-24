// PMO System - Weekly Report Cron Endpoint
// POST /api/v1/cron/weekly-report
//
// Triggered by Vercel Cron on a weekly schedule (every Monday at 09:00 UTC).
// Iterates over all active organizations and triggers PMO report generation
// for any organization whose weeklyReportDay matches today's day of week.
//
// Authentication: Bearer token via Authorization header (CRON_SECRET).
// Reports are created in DRAFT status — auto-publish is explicitly prohibited.
//
// Cron schedule (vercel.json): "0 9 * * 1" (Monday 09:00 UTC)

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { executeRun } from "@/lib/domain/agent-orchestrator";
import { recordAudit } from "@/lib/domain/audit";

// ---------------------------------------------------------------------------
// Day-of-week mapping
// ---------------------------------------------------------------------------

/** Maps JS getDay() result (0=Sunday) to WeekDay enum values */
const DAY_INDEX_TO_WEEKDAY = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

type WeekDayString = (typeof DAY_INDEX_TO_WEEKDAY)[number];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/cron/weekly-report
 *
 * Processes all active organizations and generates weekly PMO reports
 * for those configured to receive a report today (based on weeklyReportDay).
 *
 * Security: Verifies Authorization: Bearer <CRON_SECRET> header.
 * IMPORTANT: Generated reports are always in DRAFT status. Never auto-published.
 */
export async function POST(req: NextRequest): Promise<Response> {
  // -------------------------------------------------------------------------
  // 1. Authenticate via CRON_SECRET
  // -------------------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/weekly-report] CRON_SECRET environment variable is not set");
    return Response.json(
      { success: false, error: "Cron secret not configured" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const providedToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!providedToken || providedToken !== cronSecret) {
    console.warn("[cron/weekly-report] Unauthorized access attempt");
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Determine today's weekday
  // -------------------------------------------------------------------------
  const today = new Date();
  const todayWeekday: WeekDayString = DAY_INDEX_TO_WEEKDAY[today.getDay()];

  // Date range: last 7 days up to today (inclusive)
  const periodEnd = new Date(today);
  periodEnd.setUTCHours(0, 0, 0, 0);
  const periodStart = new Date(periodEnd);
  periodStart.setUTCDate(periodEnd.getUTCDate() - 7);

  console.log(
    `[cron/weekly-report] Starting weekly report run for weekday=${todayWeekday}`,
    `period=${periodStart.toISOString()} to ${periodEnd.toISOString()}`
  );

  // -------------------------------------------------------------------------
  // 3. Fetch all active organizations configured for today's weekday
  // -------------------------------------------------------------------------
  const organizations = await prisma.organization.findMany({
    where: {
      deletedAt: null,
      weeklyReportDay: todayWeekday,
    },
    select: {
      id: true,
      name: true,
      weeklyReportDay: true,
    },
  });

  if (organizations.length === 0) {
    console.log(
      `[cron/weekly-report] No organizations configured for weekday=${todayWeekday}`
    );
    return Response.json(
      {
        success: true,
        data: {
          processedOrganizations: 0,
          weekday: todayWeekday,
          skippedReasons: ["No organizations match today's weeklyReportDay"],
        },
      },
      { status: 200 }
    );
  }

  // -------------------------------------------------------------------------
  // 4. Process each organization
  // -------------------------------------------------------------------------
  const results: Array<{
    organizationId: string;
    organizationName: string;
    status: "triggered" | "skipped" | "failed";
    reason?: string;
    runId?: string;
    reportId?: string | null;
  }> = [];

  for (const org of organizations) {
    try {
      // Find the OWNER of this organization to act as the run creator
      const ownerRole = await prisma.role.findFirst({
        where: { organizationId: org.id, name: "OWNER" },
        select: { id: true },
      });

      if (!ownerRole) {
        results.push({
          organizationId: org.id,
          organizationName: org.name,
          status: "skipped",
          reason: "No OWNER role found for organization",
        });
        continue;
      }

      const ownerUser = await prisma.user.findFirst({
        where: {
          organizationId: org.id,
          roleId: ownerRole.id,
          deletedAt: null,
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (!ownerUser) {
        results.push({
          organizationId: org.id,
          organizationName: org.name,
          status: "skipped",
          reason: "No active OWNER user found for organization",
        });
        continue;
      }

      // Collect active projects (IN_PROGRESS or BLOCKED) for this organization
      const activeProjects = await prisma.project.findMany({
        where: {
          organizationId: org.id,
          deletedAt: null,
          status: { in: ["IN_PROGRESS", "BLOCKED"] },
        },
        select: { id: true },
      });

      if (activeProjects.length === 0) {
        results.push({
          organizationId: org.id,
          organizationName: org.name,
          status: "skipped",
          reason: "No active (IN_PROGRESS or BLOCKED) projects found",
        });
        continue;
      }

      const projectIds = activeProjects.map((p) => p.id);

      // Trigger the report generation pipeline (result is always DRAFT — never auto-published)
      const runResult = await executeRun(
        org.id,
        ownerUser.id,
        {
          periodStart,
          periodEnd,
          projectIds,
          detailLevel: "STANDARD",
        },
        {}
      );

      // Record audit log (non-blocking — audit failure must not break cron)
      await recordAudit({
        organizationId: org.id,
        actorId: ownerUser.id,
        action: "REPORT_GENERATED",
        entityType: "Report",
        entityId: runResult.reportId ?? runResult.runId,
        meta: {
          trigger: "cron:weekly-report",
          weekday: todayWeekday,
          projectCount: projectIds.length,
          runStatus: runResult.status,
          isCronGenerated: true,
        },
      });

      results.push({
        organizationId: org.id,
        organizationName: org.name,
        status: runResult.status === "COMPLETED" ? "triggered" : "failed",
        reason: runResult.errorMessage ?? undefined,
        runId: runResult.runId,
        reportId: runResult.reportId,
      });

      console.log(
        `[cron/weekly-report] org=${org.name} (${org.id}) runStatus=${runResult.status}`,
        runResult.reportId ? `reportId=${runResult.reportId}` : `error=${runResult.errorMessage}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[cron/weekly-report] Failed to process org=${org.name} (${org.id}):`,
        errorMessage
      );
      results.push({
        organizationId: org.id,
        organizationName: org.name,
        status: "failed",
        reason: errorMessage,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Summarize and return
  // -------------------------------------------------------------------------
  const triggered = results.filter((r) => r.status === "triggered").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(
    `[cron/weekly-report] Completed: triggered=${triggered}, skipped=${skipped}, failed=${failed}`
  );

  return Response.json(
    {
      success: true,
      data: {
        weekday: todayWeekday,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
        processedOrganizations: organizations.length,
        triggered,
        skipped,
        failed,
        results,
      },
    },
    { status: 200 }
  );
}
