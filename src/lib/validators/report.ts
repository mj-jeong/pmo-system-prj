// PMO System - Report Validators
// Zod schemas for report API query and ID validation.

import { z } from "zod";

const reportStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);

/**
 * Schema for querying report list (pagination + status filter).
 */
export const reportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: reportStatusEnum.optional(),
});

/**
 * Schema for validating a report ID path parameter.
 */
export const reportIdSchema = z.object({
  id: z.string().cuid("Report ID must be a valid CUID"),
});

/**
 * Schema for querying agent runs list (pagination + status filter).
 */
export const agentRunQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]).optional(),
});

/**
 * Schema for validating an agent run ID path parameter.
 */
export const agentRunIdSchema = z.object({
  id: z.string().cuid("Agent run ID must be a valid CUID"),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type ReportIdInput = z.infer<typeof reportIdSchema>;
export type AgentRunQueryInput = z.infer<typeof agentRunQuerySchema>;
export type AgentRunIdInput = z.infer<typeof agentRunIdSchema>;
