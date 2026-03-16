// PMO System - Time-Off Validators
// Zod schemas for time-off API input validation.

import { z } from "zod";

const timeOffTypeEnum = z.enum([
  "VACATION",
  "HALF_DAY",
  "QUARTER_DAY",
  "SICK",
  "SPECIAL",
  "CONDOLENCE",
  "HEALTH",
  "UNPAID",
  "PAID",
]);
const timeOffStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

/**
 * Schema for creating a time-off request.
 */
export const createTimeOffSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format"),
  type: timeOffTypeEnum,
  reason: z
    .string()
    .max(1000, "Reason must not exceed 1000 characters")
    .optional(),
});

/**
 * Schema for updating a time-off request (before approval).
 */
export const updateTimeOffSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format")
    .optional(),
  type: timeOffTypeEnum.optional(),
  reason: z
    .string()
    .max(1000, "Reason must not exceed 1000 characters")
    .optional(),
});

/**
 * Schema for approving/rejecting a time-off request (ADMIN/OWNER).
 * No body required - action is determined by the endpoint.
 */
export const approveTimeOffSchema = z.object({}).strict();

export type CreateTimeOffInput = z.infer<typeof createTimeOffSchema>;
export type UpdateTimeOffInput = z.infer<typeof updateTimeOffSchema>;
