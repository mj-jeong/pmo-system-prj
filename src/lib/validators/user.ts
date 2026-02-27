// PMO System - User Validators
// Zod schemas for user/member API input validation.

import { z } from "zod";

// Shared password rule: 8+ chars, at least one letter and one number
const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .max(128, "비밀번호는 128자 이내로 입력하세요")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)/,
    "비밀번호는 영문과 숫자를 포함해야 합니다"
  );

// Shared name rule: Korean/English/numbers, no special chars, 1-50 chars
const nameSchema = z
  .string()
  .min(1, "이름을 입력하세요")
  .max(50, "이름은 50자 이내로 입력하세요")
  .regex(
    /^[가-힣a-zA-Z0-9\s]+$/,
    "이름은 한글, 영문, 숫자만 사용할 수 있습니다"
  );

/**
 * Schema for user registration (creates new org + first OWNER user).
 * confirmPassword is client-side only; stripped before sending to API.
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .email("유효한 이메일 주소를 입력하세요")
      .max(254, "이메일 주소가 너무 깁니다"),
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
    organizationName: z
      .string()
      .min(2, "조직명은 2자 이상이어야 합니다")
      .max(100, "조직명은 100자 이내로 입력하세요"),
    organizationSlug: z
      .string()
      .min(2, "슬러그는 2자 이상이어야 합니다")
      .max(50, "슬러그는 50자 이내로 입력하세요")
      .regex(
        /^[a-z0-9-]+$/,
        "슬러그는 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * Server-side schema for POST /api/v1/auth/register.
 * confirmPassword is stripped by the frontend before sending — server does not need it.
 */
export const registerApiSchema = z.object({
  email: z
    .string()
    .email("유효한 이메일 주소를 입력하세요")
    .max(254, "이메일 주소가 너무 깁니다"),
  name: nameSchema,
  password: passwordSchema,
  organizationName: z
    .string()
    .min(2, "조직명은 2자 이상이어야 합니다")
    .max(100, "조직명은 100자 이내로 입력하세요"),
  organizationSlug: z
    .string()
    .min(2, "슬러그는 2자 이상이어야 합니다")
    .max(50, "슬러그는 50자 이내로 입력하세요")
    .regex(
      /^[a-z0-9-]+$/,
      "슬러그는 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다"
    ),
});

/**
 * Schema for join organization request (no auth required).
 * User sets their own password; stored as hashed in MembershipRequest.
 */
export const joinRequestSchema = z
  .object({
    email: z
      .string()
      .email("유효한 이메일 주소를 입력하세요")
      .max(254, "이메일 주소가 너무 깁니다"),
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
    organizationId: z.string().min(1, "조직을 선택하세요"),
    message: z.string().max(200, "메모는 200자 이내로 입력하세요").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * Schema for token-based member invitation (replaces direct password invite).
 * Admin/Owner selects delivery method; email required only for EMAIL method.
 */
export const sendInviteSchema = z
  .object({
    deliveryMethod: z.enum(["EMAIL", "QR_CODE", "LINK"]),
    email: z.string().email("유효한 이메일 주소를 입력하세요").optional(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === "EMAIL" && !data.email) return false;
      return true;
    },
    { message: "이메일 발송 방식에는 이메일 주소가 필요합니다", path: ["email"] }
  );

/**
 * Schema for accepting an invitation (user sets their own name and password).
 */
export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, "초대 토큰이 유효하지 않습니다"),
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * Schema for inviting a new member (legacy - kept for backward compatibility).
 * @deprecated Use sendInviteSchema for token-based invite flow.
 */
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

/**
 * Schema for changing a user's role (OWNER only).
 */
export const changeRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

/**
 * Schema for approving or rejecting a membership request.
 */
export const reviewMembershipSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterApiInput = z.infer<typeof registerApiSchema>;
export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
export type SendInviteInput = z.infer<typeof sendInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type ReviewMembershipInput = z.infer<typeof reviewMembershipSchema>;
