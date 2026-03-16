// PMO System - User Registration API
// POST /api/v1/auth/register
// Creates a new organization and user (first user becomes OWNER).

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || `org-${Date.now()}`;
}

import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { registerApiSchema } from "@/lib/validators/user";
import { createSuccessResponse } from "@/types/api";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerApiSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid input.", 400, details);
    }

    const { email, name, password, organizationName } = parsed.data;
    const rawSlug = parsed.data.organizationSlug;

    // Use provided slug or auto-generate from organization name
    let organizationSlug = rawSlug && rawSlug.length >= 2 ? rawSlug : generateSlug(organizationName);

    // Check if slug is taken; append suffix if auto-generated slug conflicts
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });

    if (existingOrg) {
      if (rawSlug && rawSlug.length >= 2) {
        // User explicitly provided this slug — return conflict error
        return createErrorResponse(ERROR_CODES.ORG_SLUG_TAKEN, "Organization slug is already in use.", 409);
      }
      // Auto-generated slug conflicts — append timestamp suffix
      organizationSlug = `${organizationSlug}-${Date.now().toString(36)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization with roles and first user (OWNER) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
        },
      });

      // 2. Create roles for the organization
      const ownerRole = await tx.role.create({
        data: { name: "OWNER", organizationId: organization.id },
      });
      await tx.role.create({
        data: { name: "ADMIN", organizationId: organization.id },
      });
      await tx.role.create({
        data: { name: "MEMBER", organizationId: organization.id },
      });

      // 3. Check email uniqueness within org
      const existingUser = await tx.user.findUnique({
        where: {
          email_organizationId: {
            email,
            organizationId: organization.id,
          },
        },
      });

      if (existingUser) {
        throw new Error("EMAIL_EXISTS");
      }

      // 4. Create user with OWNER role
      const user = await tx.user.create({
        data: {
          email,
          name,
          hashedPassword,
          organizationId: organization.id,
          roleId: ownerRole.id,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "OWNER",
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
      };
    });

    return Response.json(createSuccessResponse(result), { status: 201 });
  } catch (error: any) {
    if (error?.message === "EMAIL_EXISTS") {
      return createErrorResponse(ERROR_CODES.EMAIL_ALREADY_EXISTS, "Email already registered.", 409);
    }

    console.error("[POST /api/v1/auth/register]", error);
    return createErrorResponse(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred.", 500);
  }
}
