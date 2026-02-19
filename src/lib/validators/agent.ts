// PMO System - Agent Validators
// Zod schemas for agent API input validation.

import { z } from "zod";

const detailLevelEnum = z.enum(["BRIEF", "STANDARD", "DETAILED"]);

/**
 * Schema for generating a new PMO report via the agent.
 * Validates period range, project selection, and detail level.
 */
export const generateReportSchema = z
  .object({
    periodStart: z.coerce.date({
      required_error: "Period start date is required",
      invalid_type_error: "Period start must be a valid date",
    }),
    periodEnd: z.coerce.date({
      required_error: "Period end date is required",
      invalid_type_error: "Period end must be a valid date",
    }),
    projectIds: z
      .array(z.string().cuid("Each project ID must be a valid CUID"))
      .min(1, "At least one project must be selected"),
    detailLevel: detailLevelEnum.optional().default("STANDARD"),
  })
  .refine((data) => data.periodStart < data.periodEnd, {
    message: "Period start must be before period end",
    path: ["periodEnd"],
  });

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
