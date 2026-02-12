// PMO System - User Domain Service
// Business logic for user/member management within an organization.
// All queries MUST be scoped to organizationId.

import { prisma } from "@/lib/db/prisma";
import type { RoleName } from "@/types";

export const userService = {
  /**
   * List all members in the organization (excludes soft-deleted).
   */
  async getUsers(organizationId: string) {
    return prisma.user.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        role: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get a single user by ID within the organization.
   */
  async getUserById(userId: string, organizationId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
      include: {
        role: { select: { name: true } },
      },
    });
  },

  /**
   * Invite (create) a new member in the organization with a specified role.
   */
  async inviteUser(
    data: { email: string; name: string; hashedPassword: string },
    roleName: RoleName,
    organizationId: string
  ) {
    // Find the role record for this organization
    const role = await prisma.role.findUnique({
      where: {
        name_organizationId: {
          name: roleName,
          organizationId,
        },
      },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found for organization ${organizationId}`);
    }

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hashedPassword: data.hashedPassword,
        organizationId,
        roleId: role.id,
      },
      include: {
        role: { select: { name: true } },
      },
    });
  },

  /**
   * Change a user's role (OWNER only).
   */
  async changeRole(userId: string, newRole: RoleName, organizationId: string) {
    // Find the new role record
    const role = await prisma.role.findUnique({
      where: {
        name_organizationId: {
          name: newRole,
          organizationId,
        },
      },
    });

    if (!role) {
      throw new Error(`Role ${newRole} not found for organization ${organizationId}`);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: {
        role: { select: { name: true } },
      },
    });
  },

  /**
   * Remove (soft-delete) a member from the organization.
   */
  async removeUser(userId: string, organizationId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * Check if an email already exists in the organization.
   */
  async isEmailTaken(email: string, organizationId: string) {
    const existing = await prisma.user.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
    });
    return !!existing;
  },

  /**
   * Verify that a user belongs to the given organization.
   */
  async verifyUserOrg(userId: string, organizationId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
    });
    return !!user;
  },
};
