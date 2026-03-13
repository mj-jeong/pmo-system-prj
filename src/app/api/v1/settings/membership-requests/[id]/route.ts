// PMO System - Membership Request Approve/Reject API
// PATCH /api/v1/settings/membership-requests/[id]
// Requires ADMIN or OWNER role.

import { NextRequest } from "next/server";
import { withOrgScope } from "@/lib/permissions/organization-scope";
import { requireAdmin } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { reviewMembershipSchema } from "@/lib/validators/user";
import { userService } from "@/lib/domain/user";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";
import { createSuccessResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/settings/membership-requests/[id]
 * Approve or reject a membership request.
 *
 * Body: { action: "APPROVE" | "REJECT" }
 *
 * On APPROVE: creates the User with MEMBER role, marks request APPROVED.
 * On REJECT:  marks request REJECTED only.
 */
export const PATCH = withOrgScope(
  requireAdmin(
    async (req: NextRequest, { session, organizationId }: { session: any; organizationId: string }, context?: RouteParams) => {
      try {
        const { id } = await (context as RouteParams).params;
        const body = await req.json();

        const parsed = reviewMembershipSchema.safeParse(body);
        if (!parsed.success) {
          return createErrorResponse(
            ERROR_CODES.VALIDATION_ERROR,
            "입력값이 올바르지 않습니다.",
            400
          );
        }

        const { action } = parsed.data;

        // Find the request scoped to this org
        const request = await prisma.membershipRequest.findFirst({
          where: { id, organizationId },
        });

        if (!request) {
          return createErrorResponse(
            ERROR_CODES.MEMBERSHIP_REQUEST_NOT_FOUND,
            "참여 요청을 찾을 수 없습니다.",
            404
          );
        }

        if (request.status !== "PENDING") {
          return createErrorResponse(
            ERROR_CODES.CONFLICT,
            "이미 처리된 요청입니다.",
            409
          );
        }

        if (action === "APPROVE") {
          // Create the user with stored credentials
          const user = await userService.inviteUser(
            {
              email: request.email,
              name: request.name,
              hashedPassword: request.hashedPassword,
            },
            "MEMBER",
            organizationId
          );

          // Mark request approved
          await prisma.membershipRequest.update({
            where: { id },
            data: {
              status: "APPROVED",
              reviewedBy: session.id,
              reviewedAt: new Date(),
            },
          });

          return Response.json(
            createSuccessResponse({
              action: "APPROVED",
              userId: user.id,
              email: user.email,
            }),
            { status: 200 }
          );
        }

        // REJECT — 민감 데이터(hashedPassword) 즉시 삭제
        await prisma.membershipRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            hashedPassword: null,
            reviewedBy: session.id,
            reviewedAt: new Date(),
          },
        });

        return Response.json(
          createSuccessResponse({ action: "REJECTED" }),
          { status: 200 }
        );
      } catch (error) {
        console.error("[PATCH /api/v1/settings/membership-requests/[id]]", error);
        return createErrorResponse(
          ERROR_CODES.INTERNAL_ERROR,
          "예기치 않은 오류가 발생했습니다.",
          500
        );
      }
    }
  )
);
