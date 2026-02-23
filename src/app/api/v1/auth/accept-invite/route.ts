// PMO System - Accept Invitation API
// POST /api/v1/auth/accept-invite
// Public endpoint — finalizes invite, creates User, returns session info.

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { verifyToken, markTokenUsed } from "@/lib/invite/token";
import { acceptInviteSchema } from "@/lib/validators/user";
import { userService } from "@/lib/domain/user";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/auth/accept-invite
 * Accept an invitation: validate token, create user, mark token used.
 *
 * Body: { token, name, password, confirmPassword }
 * Response: { id, email, name, role, organizationId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = acceptInviteSchema.safeParse(body);
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

    const { token, name, password } = parsed.data;

    // Verify token (idempotency guard inside transaction below)
    const verifyResult = await verifyToken(token);
    if (verifyResult.valid === false) {
      const errorMap = {
        TOKEN_NOT_FOUND: {
          code: ERROR_CODES.INVITATION_NOT_FOUND,
          msg: "초대 링크를 찾을 수 없습니다.",
        },
        TOKEN_EXPIRED: {
          code: ERROR_CODES.INVITATION_EXPIRED,
          msg: "초대 링크가 만료되었습니다.",
        },
        TOKEN_ALREADY_USED: {
          code: ERROR_CODES.INVITATION_ALREADY_USED,
          msg: "이미 사용된 초대 링크입니다.",
        },
      } as const;

      const { code, msg } = errorMap[verifyResult.error];
      return createErrorResponse(code, msg, 400);
    }

    const { record } = verifyResult;

    // Check if email (from token or user-provided) already exists in this org
    const emailToUse = record.email ?? `${token.slice(0, 8)}@invite.local`;
    const emailTaken = await userService.isEmailTaken(
      emailToUse,
      record.organizationId
    );
    if (emailTaken) {
      return createErrorResponse(
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        "이 이메일은 이미 조직에 등록되어 있습니다.",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to prevent race conditions on the same token
    const user = await prisma.$transaction(async (tx) => {
      // Re-check token inside transaction
      const tokenRecord = await tx.invitationToken.findUnique({
        where: { token },
      });
      if (!tokenRecord || tokenRecord.usedAt) {
        throw new Error("TOKEN_ALREADY_USED");
      }

      // Create the user
      const created = await tx.user.create({
        data: {
          email: emailToUse,
          name,
          hashedPassword,
          organizationId: record.organizationId,
          roleId: record.roleId,
        },
        include: { role: { select: { name: true } } },
      });

      // Mark token as consumed
      await tx.invitationToken.update({
        where: { token },
        data: { usedAt: new Date(), usedByEmail: emailToUse },
      });

      return created;
    });

    return Response.json(
      createSuccessResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        organizationId: user.organizationId,
        createdAt: user.createdAt.toISOString(),
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "TOKEN_ALREADY_USED") {
      return createErrorResponse(
        ERROR_CODES.INVITATION_ALREADY_USED,
        "이미 사용된 초대 링크입니다.",
        400
      );
    }
    console.error("[POST /api/v1/auth/accept-invite]", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "예기치 않은 오류가 발생했습니다.",
      500
    );
  }
}
