// PMO System - Time-Off Domain Service
// Business logic for leave request management.
// Approval/rejection requires ADMIN or OWNER role.
// All queries MUST be scoped to organizationId.

import { prisma } from "@/lib/db/prisma";
import type { CreateTimeOffInput, UpdateTimeOffInput } from "@/lib/validators/time-off";
import { recordAudit } from "@/lib/domain/audit";

export const timeOffService = {
  /**
   * Create a new time-off request.
   */
  async requestTimeOff(data: CreateTimeOffInput, userId: string, organizationId: string) {
    return prisma.timeOff.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        type: data.type,
        reason: data.reason,
        status: "PENDING",
        userId,
        organizationId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * List time-off requests with filters.
   * ADMIN/OWNER see all; MEMBER sees only their own (handled at route level).
   */
  async getTimeOffs(
    organizationId: string,
    filters: {
      userId?: string;
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { userId, status, type, page = 1, limit = 20 } = filters;

    const where: any = { organizationId };

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.timeOff.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.timeOff.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get time-off requests for a specific user.
   */
  async getTimeOffsByUser(
    userId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where = { userId, organizationId };

    const [data, total] = await Promise.all([
      prisma.timeOff.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.timeOff.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get a single time-off request by ID, scoped to organization.
   */
  async getTimeOffById(timeOffId: string, organizationId: string) {
    return prisma.timeOff.findFirst({
      where: {
        id: timeOffId,
        organizationId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Update a time-off request (only if PENDING).
   */
  async updateTimeOff(
    timeOffId: string,
    organizationId: string,
    data: UpdateTimeOffInput
  ) {
    const timeOff = await prisma.timeOff.findFirst({
      where: { id: timeOffId, organizationId },
    });

    if (!timeOff) return null;
    if (timeOff.status !== "PENDING") {
      return { error: "CANNOT_UPDATE_NON_PENDING" as const };
    }

    return {
      data: await prisma.timeOff.update({
        where: { id: timeOffId },
        data: {
          ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
          ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.reason !== undefined && { reason: data.reason }),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    };
  },

  /**
   * Approve a time-off request (ADMIN/OWNER only).
   * actorId is required for audit logging.
   */
  async approveTimeOff(timeOffId: string, organizationId: string, actorId: string) {
    const timeOff = await prisma.timeOff.findFirst({
      where: { id: timeOffId, organizationId },
    });

    if (!timeOff) return null;
    if (timeOff.status !== "PENDING") {
      return { error: "NOT_PENDING" as const };
    }

    const updated = await prisma.timeOff.update({
      where: { id: timeOffId },
      data: { status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await recordAudit({
      organizationId,
      actorId,
      action: "TIME_OFF_APPROVED",
      entityType: "TimeOff",
      entityId: timeOffId,
    });

    return { data: updated };
  },

  /**
   * Reject a time-off request (ADMIN/OWNER only).
   * actorId is required for audit logging.
   */
  async rejectTimeOff(timeOffId: string, organizationId: string, actorId: string) {
    const timeOff = await prisma.timeOff.findFirst({
      where: { id: timeOffId, organizationId },
    });

    if (!timeOff) return null;
    if (timeOff.status !== "PENDING") {
      return { error: "NOT_PENDING" as const };
    }

    const updated = await prisma.timeOff.update({
      where: { id: timeOffId },
      data: { status: "REJECTED" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await recordAudit({
      organizationId,
      actorId,
      action: "TIME_OFF_REJECTED",
      entityType: "TimeOff",
      entityId: timeOffId,
    });

    return { data: updated };
  },
};
