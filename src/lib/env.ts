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
 * Combined environment schema.
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables.
 * Throws a descriptive error at startup if validation fails.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
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
