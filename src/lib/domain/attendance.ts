// PMO System - Attendance Domain Service
// Business logic for check-in/check-out button workflow.
// Timestamps are ALWAYS generated server-side (never from client).
// All queries MUST be scoped to organizationId.

import { prisma } from "@/lib/db/prisma";

/**
 * Get today's date as a Date object at midnight UTC.
 */
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const attendanceService = {
  /**
   * Check-in: Records check-in timestamp with current server time.
   * Creates a new attendance record for today if none exists.
   * Returns null if already checked in today.
   */
  async checkIn(userId: string, organizationId: string) {
    const today = getTodayDate();
    const now = new Date();

    // Check if attendance record exists for today
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date_organizationId: {
          userId,
          date: today,
          organizationId,
        },
      },
    });

    if (existing) {
      // Already has an attendance record for today
      if (existing.checkIn) {
        return { error: "ALREADY_CHECKED_IN" as const };
      }
      // Record exists (e.g., marked ABSENT) - update with check-in
      return {
        data: await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkIn: now,
            status: "CHECKED_IN",
          },
        }),
      };
    }

    // Create new attendance record with check-in
    return {
      data: await prisma.attendance.create({
        data: {
          userId,
          date: today,
          checkIn: now,
          status: "CHECKED_IN",
          organizationId,
        },
      }),
    };
  },

  /**
   * Check-out: Records check-out timestamp with current server time.
   * Requires an existing check-in record for today.
   */
  async checkOut(userId: string, organizationId: string) {
    const today = getTodayDate();
    const now = new Date();

    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date_organizationId: {
          userId,
          date: today,
          organizationId,
        },
      },
    });

    if (!existing || !existing.checkIn) {
      return { error: "NOT_CHECKED_IN" as const };
    }

    if (existing.checkOut) {
      return { error: "ALREADY_CHECKED_OUT" as const };
    }

    return {
      data: await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: now,
          status: "CHECKED_OUT",
        },
      }),
    };
  },

  /**
   * Get today's attendance record for a specific user.
   */
  async getTodayAttendance(userId: string, organizationId: string) {
    const today = getTodayDate();

    return prisma.attendance.findUnique({
      where: {
        userId_date_organizationId: {
          userId,
          date: today,
          organizationId,
        },
      },
    });
  },

  /**
   * List all attendance records with filters (ADMIN/OWNER).
   * Scoped to organization.
   */
  async getAttendance(
    organizationId: string,
    filters: {
      userId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { userId, date, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: any = { organizationId };

    if (userId) {
      where.userId = userId;
    }

    if (date) {
      where.date = new Date(date);
    } else {
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get attendance history for a specific user (ADMIN/OWNER or self-view).
   */
  async getAttendanceByUser(
    userId: string,
    organizationId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { startDate, endDate, page = 1, limit = 20 } = filters;

    const where: any = {
      userId,
      organizationId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get attendance summary for a specific date (present/absent/on-leave counts).
   */
  async getAttendanceSummary(organizationId: string, date?: string) {
    const targetDate = date ? new Date(date) : getTodayDate();

    const [checkedIn, checkedOut, absent] = await Promise.all([
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
      prisma.attendance.count({
        where: {
          organizationId,
          date: targetDate,
          status: "ABSENT",
        },
      }),
    ]);

    return {
      present: checkedIn + checkedOut,
      checkedIn,
      checkedOut,
      absent,
      date: targetDate.toISOString(),
    };
  },

  /**
   * Manual correction of an attendance record (ADMIN/OWNER).
   */
  async updateAttendance(
    attendanceId: string,
    organizationId: string,
    data: {
      checkIn?: string;
      checkOut?: string;
      status?: "CHECKED_IN" | "CHECKED_OUT" | "ABSENT";
    }
  ) {
    // Verify attendance record belongs to this organization
    const attendance = await prisma.attendance.findFirst({
      where: { id: attendanceId, organizationId },
    });

    if (!attendance) return null;

    return prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...(data.checkIn !== undefined && { checkIn: new Date(data.checkIn) }),
        ...(data.checkOut !== undefined && { checkOut: new Date(data.checkOut) }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  },
};
