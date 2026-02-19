// PMO System - Agent Data Collection Tools
// Provides data collection functions for the PMO report agent pipeline.
// CRITICAL: All queries MUST filter by organizationId for tenant isolation.
// NO AI/LLM calls in this file - data retrieval only.

import { prisma } from "@/lib/db/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionParams {
  periodStart: Date;
  periodEnd: Date;
  projectIds: string[];
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  updatedAt: Date;
}

export interface ProjectUpdateRecord {
  id: string;
  content: string;
  projectId: string;
  projectName: string;
  authorName: string;
  createdAt: Date;
}

export interface AttendanceDaySummary {
  date: Date;
  totalMembers: number;
  present: number;
  absent: number;
  rate: number;
}

export interface TimeOffSummaryRecord {
  userId: string;
  userName: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

// ---------------------------------------------------------------------------
// Agent Tools
// ---------------------------------------------------------------------------

export const agentTools = {
  /**
   * Retrieve a snapshot of all selected projects within the organization.
   * Returns current status, progress, and timeline for each project.
   */
  async getProjectsSnapshot(
    organizationId: string,
    params: CollectionParams
  ): Promise<ProjectSnapshot[]> {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        id: { in: params.projectIds },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    return projects;
  },

  /**
   * Retrieve all project updates within the reporting period for selected projects.
   * Includes author and project names for narrative generation.
   */
  async getProjectUpdates(
    organizationId: string,
    params: CollectionParams
  ): Promise<ProjectUpdateRecord[]> {
    const updates = await prisma.projectUpdate.findMany({
      where: {
        organizationId,
        projectId: { in: params.projectIds },
        createdAt: {
          gte: params.periodStart,
          lte: params.periodEnd,
        },
      },
      include: {
        project: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return updates.map((u) => ({
      id: u.id,
      content: u.content,
      projectId: u.projectId,
      projectName: u.project.name,
      authorName: u.author.name,
      createdAt: u.createdAt,
    }));
  },

  /**
   * Retrieve daily attendance summary for the reporting period.
   * Computes present/absent counts and attendance rate per day.
   */
  async getAttendanceSummary(
    organizationId: string,
    params: CollectionParams
  ): Promise<AttendanceDaySummary[]> {
    // Get total active members in the organization
    const totalMembers = await prisma.user.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    if (totalMembers === 0) {
      return [];
    }

    // Get all attendance records for the period
    const records = await prisma.attendance.findMany({
      where: {
        organizationId,
        date: {
          gte: params.periodStart,
          lte: params.periodEnd,
        },
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: { date: "asc" },
    });

    // Group by date and compute daily summaries
    const dailyMap = new Map<string, { present: number; total: number }>();

    for (const record of records) {
      const dateKey = record.date.toISOString().split("T")[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { present: 0, total: totalMembers });
      }
      const entry = dailyMap.get(dateKey)!;
      if (record.status === "CHECKED_IN" || record.status === "CHECKED_OUT") {
        entry.present += 1;
      }
    }

    const summaries: AttendanceDaySummary[] = [];
    for (const [dateKey, entry] of dailyMap) {
      const absent = entry.total - entry.present;
      const rate = entry.total > 0 ? Math.round((entry.present / entry.total) * 100) : 0;
      summaries.push({
        date: new Date(dateKey),
        totalMembers: entry.total,
        present: entry.present,
        absent,
        rate,
      });
    }

    return summaries.sort((a, b) => a.date.getTime() - b.date.getTime());
  },

  /**
   * Retrieve approved and pending time-off requests overlapping the reporting period.
   * Includes user name and calculated duration in business days.
   */
  async getTimeOffSummary(
    organizationId: string,
    params: CollectionParams
  ): Promise<TimeOffSummaryRecord[]> {
    const timeOffs = await prisma.timeOff.findMany({
      where: {
        organizationId,
        status: { in: ["APPROVED", "PENDING"] },
        // Overlaps with reporting period
        startDate: { lte: params.periodEnd },
        endDate: { gte: params.periodStart },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { startDate: "asc" },
    });

    return timeOffs.map((t) => {
      // Calculate number of days (simple calendar days)
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(
        1,
        Math.ceil((t.endDate.getTime() - t.startDate.getTime()) / msPerDay) + 1
      );

      return {
        userId: t.user.id,
        userName: t.user.name,
        type: t.type,
        status: t.status,
        startDate: t.startDate,
        endDate: t.endDate,
        days,
      };
    });
  },
};
