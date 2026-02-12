// PMO System - User Validators
// Zod schemas for user/member API input validation.

import { z } from "zod";

/**
 * Schema for inviting a new member to the organization.
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
 * Schema for user registration (creates org + user).
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must not exceed 100 characters"),
  organizationSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
