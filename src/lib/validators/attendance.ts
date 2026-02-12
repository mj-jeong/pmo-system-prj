// PMO System - Attendance Validators
// Zod schemas for attendance API input validation.
// Note: Check-in/check-out require NO request body (timestamps are server-generated).

import { z } from "zod";

/**
 * Check-in schema.
 * No body required - timestamp is recorded server-side when user clicks the button.
 */
export const checkInSchema = z.object({}).strict();

/**
 * Check-out schema.
 * No body required - timestamp is recorded server-side when user clicks the button.
 */
export const checkOutSchema = z.object({}).strict();

/**
 * Schema for querying attendance records (ADMIN/OWNER).
 */
export const attendanceQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/**
 * Schema for manual attendance correction (ADMIN/OWNER only).
 */
export const updateAttendanceSchema = z.object({
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.enum(["CHECKED_IN", "CHECKED_OUT", "ABSENT"]).optional(),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
