// PMO System - Email Service (Resend)
// Handles transactional emails for invitation flow.

import { Resend } from "resend";
import { env } from "@/lib/env";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not configured. " +
          "Set it in .env.local to enable email invitations."
      );
    }
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendInviteEmailOptions {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  role: string;
  expiresAt: Date;
}

/**
 * Send an invitation email to a new member.
 * Throws if RESEND_API_KEY is not configured or send fails.
 */
export async function sendInviteEmail(
  options: SendInviteEmailOptions
): Promise<void> {
  const resend = getResend();

  const expiresFormatted = options.expiresAt.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const roleKorean = options.role === "ADMIN" ? "관리자" : "멤버";

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>조직 초대</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111827; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">🎉 조직 초대</h1>
    <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
      <strong>${options.inviterName}</strong>님이 <strong>${options.organizationName}</strong> 조직에
      <strong>${roleKorean}</strong>로 초대했습니다.
    </p>
    <a href="${options.inviteUrl}"
       style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
      초대 수락하기
    </a>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px;">
      이 초대 링크는 <strong style="color: #6b7280;">${expiresFormatted}</strong>까지 유효합니다.
    </p>
    <p style="font-size: 12px; color: #d1d5db; margin: 0; word-break: break-all;">
      버튼이 작동하지 않으면: <a href="${options.inviteUrl}" style="color: #93c5fd;">${options.inviteUrl}</a>
    </p>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "PMO System <noreply@pmo-system.dev>",
    to: options.to,
    subject: `[PMO System] ${options.organizationName} 조직 초대`,
    html,
  });

  if (error) {
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
}
