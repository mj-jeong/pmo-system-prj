// PMO System - Project Domain Service
// Business logic for project and project-update management.
// All queries MUST be scoped to organizationId.

import { prisma } from "@/lib/db/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators/project";

export const projectService = {
  /**
   * Create a new project within the organization.
   */
  async createProject(data: CreateProjectInput, organizationId: string) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || "IN_PROGRESS",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        progress: data.progress ?? 0,
        organizationId,
      },
    });
  },

  /**
   * List projects with pagination and optional filters.
   * Excludes soft-deleted projects.
   */
  async getProjects(
    organizationId: string,
    filters: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    const { status, search, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = filters;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Get a single project by ID, scoped to organization.
   * Excludes soft-deleted.
   */
  async getProjectById(projectId: string, organizationId: string) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
        deletedAt: null,
      },
    });
  },

  /**
   * Update a project, scoped to organization.
   */
  async updateProject(projectId: string, organizationId: string, data: UpdateProjectInput) {
    // First verify the project belongs to this organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId, deletedAt: null },
    });

    if (!project) return null;

    return prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.progress !== undefined && { progress: data.progress }),
      },
    });
  },

  /**
   * Soft-delete a project, scoped to organization.
   */
  async deleteProject(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId, deletedAt: null },
    });

    if (!project) return null;

    return prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * Add a project update (log entry).
   */
  async addProjectUpdate(
    projectId: string,
    organizationId: string,
    data: { content: string },
    authorId: string
  ) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId, deletedAt: null },
    });

    if (!project) return null;

    return prisma.projectUpdate.create({
      data: {
        content: data.content,
        projectId,
        authorId,
        organizationId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * List project updates for a project, scoped to organization.
   */
  async getProjectUpdates(
    projectId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 20
  ) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId, deletedAt: null },
    });

    if (!project) return null;

    const [data, total] = await Promise.all([
      prisma.projectUpdate.findMany({
        where: {
          projectId,
          organizationId,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.projectUpdate.count({
        where: { projectId, organizationId },
      }),
    ]);

    return { data, total, page, limit };
  },
};
