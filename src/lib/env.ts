// PMO System - Environment Variable Validation
// Validates all required environment variables at startup using Zod.
// This prevents runtime errors from missing or invalid configuration.

import { z } from "zod";

/**
 * Server-side environment variables schema.
 * These are NEVER exposed to the browser.
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z
    .string()
    .min(1, "NEXTAUTH_URL is required")
    .url("NEXTAUTH_URL must be a valid URL"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // CI environment detection
  // Set automatically by CI/CD systems (GitHub Actions, GitLab CI, etc.)
  // When "true": Forces LLM_MODE=mock regardless of other settings
  CI: z
    .string()
    .optional(),

  // LLM Mode Selection (recommended)
  // - "mock": Always use Mock provider, no API key needed, $0 cost
  // - "real": Always use OpenAI provider, requires OPENAI_API_KEY
  // - "auto" (default): Use OpenAI if API key available, fallback to Mock
  LLM_MODE: z
    .enum(["mock", "real", "auto"])
    .optional()
    .default("auto"),

  // OpenAI Billing Toggle (LEGACY - use LLM_MODE instead)
  // Maintained for backward compatibility with Phase 6-A configuration.
  // When false (default): Mock LLM mode - no OpenAI API calls, no costs.
  // When true: Real OpenAI API mode - requires valid OPENAI_API_KEY.
  OPENAI_BILLING_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // OpenAI API key - required when LLM_MODE=real or OPENAI_BILLING_ENABLED=true
  // Optional for LLM_MODE=mock and LLM_MODE=auto (graceful fallback)
  OPENAI_API_KEY: z
    .string()
    .optional()
    .default(""),
  OPENAI_MODEL: z
    .string()
    .default("gpt-4o-mini"),

  // Invitation System
  // Resend API key for sending invitation emails (required for EMAIL delivery method)
  RESEND_API_KEY: z
    .string()
    .optional()
    .default(""),

  // How long invitation tokens remain valid (in hours). Default: 48 hours.
  INVITATION_EXPIRE_HOURS: z
    .string()
    .transform(Number)
    .default("48"),

  // Cron job authentication secret.
  // Required for: POST /api/v1/cron/weekly-report
  // Generate with: openssl rand -base64 32
  CRON_SECRET: z
    .string()
    .min(32, "CRON_SECRET must be at least 32 characters")
    .optional(),
});

/**
 * Client-side environment variables schema.
 * Only NEXT_PUBLIC_ prefixed variables are safe for browser exposure.
 * SECURITY: Never include secrets in client-side variables.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_APP_URL is required")
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

/**
 * Combined environment schema with cross-field validation.
 * The refine() ensures OPENAI_API_KEY is present when billing is enabled.
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema).refine(
  (data) => {
    // LLM_MODE=real requires API key (new mode selection)
    if (data.LLM_MODE === "real" && (!data.OPENAI_API_KEY || data.OPENAI_API_KEY.length === 0)) {
      return false;
    }
    // Legacy: OPENAI_BILLING_ENABLED=true requires API key (backward compatibility)
    if (data.OPENAI_BILLING_ENABLED && (!data.OPENAI_API_KEY || data.OPENAI_API_KEY.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "OPENAI_API_KEY is required when LLM_MODE=real or OPENAI_BILLING_ENABLED=true. " +
      "Set LLM_MODE=mock for development (Mock LLM mode) or provide a valid API key.",
    path: ["OPENAI_API_KEY"],
  }
);

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables.
 * Throws a descriptive error at startup if validation fails.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues;
    const errorMessages = issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Environment variable validation failed:\n${errorMessages}\n\n` +
        "Please check your .env.local file against .env.example."
    );
  }

  return parsed.data;
}

/**
 * Validated environment variables.
 * Access this instead of process.env directly for type safety.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const dbUrl = env.DATABASE_URL;
 */
export const env = validateEnv();
