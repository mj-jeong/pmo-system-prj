// PMO System - Join Organization Request API
// POST /api/v1/auth/join-request
// Public endpoint — creates a MembershipRequest pending Owner/Admin approval.

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { joinRequestSchema } from "@/lib/validators/user";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/auth/join-request
 * Submit a request to join an existing organization.
 * Status starts as PENDING; Owner/Admin must approve via Settings > Members.
 *
 * Body: { email, name, password, confirmPassword, organizationId, message? }
 * Response: { requestId, status: "PENDING" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = joinRequestSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "입력값이 올바르지 않습니다.",
        400,
        details
      );
    }

    const { email, name, password, organizationId, message } = parsed.data;

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: organizationId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!org) {
      return createErrorResponse(
        ERROR_CODES.ORG_NOT_FOUND,
        "조직을 찾을 수 없습니다.",
        404
      );
    }

    // Check email not already a member
    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (existingUser) {
      return createErrorResponse(
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        "이 이메일은 이미 조직의 멤버입니다.",
        409
      );
    }

    // Check no pending request for same email + org
    const existingRequest = await prisma.membershipRequest.findFirst({
      where: { email, organizationId, status: "PENDING" },
      select: { id: true },
    });
    if (existingRequest) {
      return createErrorResponse(
        ERROR_CODES.JOIN_REQUEST_ALREADY_PENDING,
        "이미 대기 중인 참여 요청이 있습니다.",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const request = await prisma.membershipRequest.create({
      data: {
        email,
        name,
        hashedPassword,
        organizationId,
        message,
      },
      select: { id: true, status: true, createdAt: true },
    });

    return Response.json(
      createSuccessResponse({
        requestId: request.id,
        status: request.status,
        organizationName: org.name,
        createdAt: request.createdAt.toISOString(),
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/v1/auth/join-request]", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "예기치 않은 오류가 발생했습니다.",
      500
    );
  }
}
