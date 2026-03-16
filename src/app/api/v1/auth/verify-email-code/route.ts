// PMO System - Email Verification Code Verify API
// POST /api/v1/auth/verify-email-code
// Public endpoint — no authentication required.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { verifyEmailCodeSchema } from "@/lib/validators/user";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/auth/verify-email-code
 * Verify the 6-digit code and check global email availability.
 *
 * Body: { email: string, code: string }
 * Response 200: { success: true, data: { verified: true, available: boolean } }
 * Response 400: EMAIL_VERIFICATION_INVALID (코드 불일치 또는 5회 초과 잠금)
 * Response 404: EMAIL_VERIFICATION_NOT_FOUND (발송 이력 없음)
 * Response 410: EMAIL_VERIFICATION_EXPIRED (10분 만료)
 */
export async function POST(req: NextRequest): Promise<Response> {
  // 1. Zod 입력 검증
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "요청 본문이 올바르지 않습니다.", 400);
  }

  const parsed = verifyEmailCodeSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "입력값이 올바르지 않습니다.", 400, details);
  }

  const { email, code } = parsed.data;

  try {
    // 2. 해당 email의 최신 미검증 레코드 조회
    const record = await prisma.emailVerification.findFirst({
      where: { email, verifiedAt: null },
      orderBy: { createdAt: "desc" },
    });

    // 3. 레코드 없음
    if (!record) {
      return createErrorResponse(
        ERROR_CODES.EMAIL_VERIFICATION_NOT_FOUND,
        "인증 코드를 먼저 발송해주세요.",
        404
      );
    }

    // 4. 만료 확인
    if (record.expiresAt < new Date()) {
      return createErrorResponse(
        ERROR_CODES.EMAIL_VERIFICATION_EXPIRED,
        "인증 시간이 만료되었습니다. 코드를 다시 발송해주세요.",
        410
      );
    }

    // 5. 오입력 횟수 초과 (잠금)
    if (record.attempts >= 5) {
      return createErrorResponse(
        ERROR_CODES.EMAIL_VERIFICATION_INVALID,
        "인증 시도 횟수를 초과했습니다. 코드를 다시 발송해주세요.",
        400
      );
    }

    // 6. 코드 불일치 → attempts 증가 후 오류 반환
    if (record.code !== code) {
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = 4 - record.attempts; // 방금 increment 전 값 기준
      return createErrorResponse(
        ERROR_CODES.EMAIL_VERIFICATION_INVALID,
        remaining > 0
          ? `인증 코드가 올바르지 않습니다. (${remaining}회 남음)`
          : "인증 시도 횟수를 초과했습니다. 코드를 다시 발송해주세요.",
        400
      );
    }

    // 7. 코드 일치 → verifiedAt 저장
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    // 8. Global 이메일 중복 검사
    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });

    // 9. 검증 완료 응답
    return Response.json(
      createSuccessResponse({ verified: true, available: !existingUser }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/v1/auth/verify-email-code]", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "인증 코드 확인 중 오류가 발생했습니다.",
      500
    );
  }
}
