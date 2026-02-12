// PMO System - Dashboard Domain Service
// Aggregated metrics for the dashboard.
// All queries MUST be scoped to organizationId.

import { prisma } from "@/lib/db/prisma";

/**
 * Get today's date as a Date object at midnight UTC.
 */
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const dashboardService = {
  /**
   * Get dashboard summary: total projects, delayed count, average progress.
   */
  async getDashboardSummary(organizationId: string) {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        status: true,
        progress: true,
      },
    });

    const totalProjects = projects.length;
    const delayedProjects = projects.filter((p) => p.status === "DELAYED").length;
    const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
    const inProgressProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const averageProgress =
      totalProjects > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
        : 0;

    return {
      totalProjects,
      delayedProjects,
      completedProjects,
      inProgressProjects,
      averageProgress,
    };
  },

  /**
   * Get workforce summary: present, absent, on-leave counts for today.
   */
  async getWorkforceSummary(organizationId: string, date?: string) {
    const targetDate = date ? new Date(date) : getTodayDate();

    // Count total active members
    const totalMembers = await prisma.user.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    // Count attendance statuses for the target date
    const [checkedIn, checkedOut] = await Promise.all([
      prisma.attendance.count({
        where: {
          organizationId,
          date: targetDate,
          status: "CHECKED_IN",
        },
      }),
      prisma.attendance.count({
        where: {
          organizationId,
          date: targetDate,
          status: "CHECKED_OUT",
        },
      }),
    ]);

    // Count approved time-off for the target date
    const onLeave = await prisma.timeOff.count({
      where: {
        organizationId,
        status: "APPROVED",
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    const presentToday = checkedIn + checkedOut;
    const absentToday = Math.max(0, totalMembers - presentToday - onLeave);

    return {
      totalMembers,
      presentToday,
      absentToday,
      onLeaveToday: onLeave,
    };
  },

  /**
   * Get recent project updates (across all projects in the organization).
   */
  async getRecentUpdates(organizationId: string, limit: number = 10) {
    return prisma.projectUpdate.findMany({
      where: { organizationId },
      include: {
        project: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
