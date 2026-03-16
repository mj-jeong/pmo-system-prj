// PMO System - Email Verification Code Send API
// POST /api/v1/auth/send-verification
// Public endpoint — no authentication required.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { sendVerificationSchema } from "@/lib/validators/user";
import { createSuccessResponse } from "@/types/api";

// 10분 내 IP당 최대 3회 발송
const verificationSendLimiter = createRateLimiter({
  windowMs: 10 * 60_000,
  maxRequests: 3,
});

/**
 * POST /api/v1/auth/send-verification
 * Generate a 6-digit code and send it to the given email address.
 *
 * Body: { email: string }
 * Response 200: { success: true, data: { sent: true } }
 * Response 400: VALIDATION_ERROR
 * Response 429: RATE_LIMIT_EXCEEDED
 */
export async function POST(req: NextRequest): Promise<Response> {
  // 1. Rate limit (IP 기준)
  const ip = getClientIp(req);
  const rl = verificationSendLimiter.check(ip);
  if (!rl.allowed) {
    return createErrorResponse(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      "잠시 후 다시 시도해주세요. (10분 내 3회 제한)",
      429
    );
  }

  // 2. Zod 입력 검증
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "요청 본문이 올바르지 않습니다.", 400);
  }

  const parsed = sendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "유효한 이메일 주소를 입력하세요.", 400, details);
  }

  const { email } = parsed.data;

  try {
    // 3. 6자리 난수 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60_000); // 10분 후 만료

    // 4. 기존 미검증 레코드 삭제 후 새 레코드 생성
    await prisma.$transaction([
      prisma.emailVerification.deleteMany({
        where: { email, verifiedAt: null },
      }),
      prisma.emailVerification.create({
        data: { email, code, expiresAt },
      }),
    ]);

    // 5. 인증 코드 이메일 발송
    if (process.env.RESEND_API_KEY) {
      await sendVerificationEmail(email, code);
    } else {
      // 개발 환경: RESEND_API_KEY 미설정 시 콘솔에 코드 출력
      console.log(`[DEV] 이메일 인증 코드 (${email}): ${code}`);
    }

    // 6. 성공 응답 (코드 미포함 — 보안)
    return Response.json(createSuccessResponse({ sent: true }), { status: 200 });
  } catch (error) {
    console.error("[POST /api/v1/auth/send-verification]", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "인증 코드 발송 중 오류가 발생했습니다.",
      500
    );
  }
}
