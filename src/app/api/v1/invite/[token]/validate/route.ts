// PMO System - Invitation Token Validation API
// GET /api/v1/invite/[token]/validate
// Public endpoint — used by accept-invite page to check token before showing form.

import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/invite/token";
import { createSuccessResponse } from "@/types/api";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/v1/invite/[token]/validate
 * Validate an invitation token and return organization/role info.
 *
 * Success response:
 *   { valid: true, organizationName, role, expiresAt }
 *
 * Error response (400):
 *   { valid: false, error: "TOKEN_NOT_FOUND" | "TOKEN_EXPIRED" | "TOKEN_ALREADY_USED" }
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { token } = await params;

  const result = await verifyToken(token);

  if (result.valid === false) {
    const errorMap = {
      TOKEN_NOT_FOUND: ERROR_CODES.INVITATION_NOT_FOUND,
      TOKEN_EXPIRED: ERROR_CODES.INVITATION_EXPIRED,
      TOKEN_ALREADY_USED: ERROR_CODES.INVITATION_ALREADY_USED,
    } as const;

    return createErrorResponse(
      errorMap[result.error],
      result.error === "TOKEN_NOT_FOUND"
        ? "초대 링크를 찾을 수 없습니다."
        : result.error === "TOKEN_EXPIRED"
        ? "초대 링크가 만료되었습니다."
        : "이미 사용된 초대 링크입니다.",
      400
    );
  }

  return Response.json(
    createSuccessResponse({
      valid: true,
      organizationName: result.record.organization.name,
      role: result.record.role.name,
      expiresAt: result.record.expiresAt.toISOString(),
    }),
    { status: 200 }
  );
}
