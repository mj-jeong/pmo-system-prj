// PMO System - Organization Domain Service
// Business logic for organization management.
// All functions receive organizationId from the session layer (never from client).

import { prisma } from "@/lib/db/prisma";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@/lib/validators/organization";
import { recordAudit } from "@/lib/domain/audit";

export const organizationService = {
  /**
   * Create a new organization with the initial OWNER/ADMIN/MEMBER roles.
   * Returns the created organization.
   */
  async createOrganization(data: CreateOrganizationInput) {
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        roles: {
          createMany: {
            data: [
              { name: "OWNER" },
              { name: "ADMIN" },
              { name: "MEMBER" },
            ],
          },
        },
      },
      include: {
        roles: true,
      },
    });

    return organization;
  },

  /**
   * Get an organization by ID (must match session org).
   * Excludes soft-deleted organizations.
   */
  async getOrganization(organizationId: string) {
    return prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null,
      },
    });
  },

  /**
   * Update the current organization.
   * actorId is required for audit logging.
   */
  async updateOrganization(
    organizationId: string,
    actorId: string,
    data: UpdateOrganizationInput
  ) {
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data,
    });

    await recordAudit({
      organizationId,
      actorId,
      action: "ORG_SETTINGS_UPDATED",
      entityType: "Organization",
      entityId: organizationId,
    });

    return updated;
  },

  /**
   * Soft-delete the organization (OWNER only).
   * Sets deletedAt timestamp.
   */
  async deleteOrganization(organizationId: string) {
    return prisma.organization.update({
      where: { id: organizationId },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * Check if a slug is already taken.
   */
  async isSlugTaken(slug: string, excludeOrgId?: string) {
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });
    if (!existing) return false;
    if (excludeOrgId && existing.id === excludeOrgId) return false;
    return true;
  },
};
