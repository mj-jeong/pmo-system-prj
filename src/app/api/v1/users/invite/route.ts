// PMO System - User Invite API Route (Token-Based Multi-Delivery)
// POST /api/v1/users/invite - Generate invitation token and deliver via selected method.
// Supports: EMAIL (Resend), QR_CODE (SVG), LINK (URL only)

import { NextRequest } from "next/server";

import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { sendInviteSchema } from "@/lib/validators/user";
import { prisma } from "@/lib/db/prisma";
import { createInvitationToken, buildInviteUrl } from "@/lib/invite/token";
import { generateInviteQRSvg } from "@/lib/invite/qrcode";
import { sendInviteEmail } from "@/lib/email/index";
import { createSuccessResponse } from "@/types/api";

/**
 * POST /api/v1/users/invite
 * Generate an invitation token and deliver via specified method.
 *
 * Body:
 *   { deliveryMethod: "EMAIL" | "QR_CODE" | "LINK", email?: string, role: "ADMIN" | "MEMBER" }
 *
 * Responses:
 *   EMAIL:   { token, inviteUrl, expiresAt, deliveredTo: email }
 *   QR_CODE: { token, inviteUrl, expiresAt, qrSvg: string }
 *   LINK:    { token, inviteUrl, expiresAt }
 */
export const POST = withOrgScope(
  requireAdmin(async (req: NextRequest, { session, organizationId }: { session: any; organizationId: string }) => {
    try {
      const body = await req.json();

      const parsed = sendInviteSchema.safeParse(body);
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

      const { deliveryMethod, email, role } = parsed.data;

      // If email delivery: check email not already a member
      if (deliveryMethod === "EMAIL" && email) {
        const existing = await prisma.user.findFirst({
          where: { email, organizationId, deletedAt: null },
          select: { id: true },
        });
        if (existing) {
          return createErrorResponse(
            ERROR_CODES.EMAIL_ALREADY_EXISTS,
            "이 이메일은 이미 조직의 멤버입니다.",
            409
          );
        }
      }

      // Find role record for the organization
      const roleRecord = await prisma.role.findFirst({
        where: { name: role, organizationId },
        select: { id: true },
      });
      if (!roleRecord) {
        return createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          "역할을 찾을 수 없습니다.",
          404
        );
      }

      // Find inviting user's name for email template
      const inviter = await prisma.user.findFirst({
        where: { id: session.id, organizationId },
        select: { name: true },
      });

      // Create the invitation token
      const tokenRecord = await createInvitationToken({
        email,
        organizationId,
        roleId: roleRecord.id,
        deliveryMethod,
        invitedBy: session.id,
      });

      const inviteUrl = buildInviteUrl(tokenRecord.token);
      const expiresAt = tokenRecord.expiresAt.toISOString();

      // EMAIL delivery
      if (deliveryMethod === "EMAIL" && email) {
        try {
          await sendInviteEmail({
            to: email,
            inviterName: inviter?.name ?? "관리자",
            organizationName: tokenRecord.organization.name,
            inviteUrl,
            role,
            expiresAt: tokenRecord.expiresAt,
          });
        } catch (emailError) {
          console.error("[invite] Email send failed:", emailError);
          // Don't fail the request — token is created, user can share link manually
        }

        return Response.json(
          createSuccessResponse({
            token: tokenRecord.token,
            inviteUrl,
            expiresAt,
            deliveredTo: email,
            deliveryMethod: "EMAIL",
          }),
          { status: 201 }
        );
      }

      // QR_CODE delivery
      if (deliveryMethod === "QR_CODE") {
        const qrSvg = await generateInviteQRSvg(tokenRecord.token);
        return Response.json(
          createSuccessResponse({
            token: tokenRecord.token,
            inviteUrl,
            expiresAt,
            qrSvg,
            deliveryMethod: "QR_CODE",
          }),
          { status: 201 }
        );
      }

      // LINK delivery
      return Response.json(
        createSuccessResponse({
          token: tokenRecord.token,
          inviteUrl,
          expiresAt,
          deliveryMethod: "LINK",
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("[POST /api/v1/users/invite]", error);
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "예기치 않은 오류가 발생했습니다.",
        500
      );
    }
  })
);
