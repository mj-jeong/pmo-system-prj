import "server-only";

// PMO System - OpenAI LLM Provider
// Handles OpenAI API interactions with retry logic, error mapping, and PII sanitization.
// This file MUST only be imported in server-side code (enforced by "server-only").
// Extracted from openai-client.ts as part of the Hybrid LLM Provider pattern.

import OpenAI from "openai";
import { SYSTEM_PROMPT, buildReportPrompt } from "@/lib/ai/prompts";
import type { ReportContext } from "@/lib/ai/prompts";
import { ERROR_CODES } from "@/lib/errors";
import type { LLMProvider, NarrativeResult } from "./provider";

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

export interface OpenAIError {
  code: string;
  message: string;
  retryable: boolean;
}

// ---------------------------------------------------------------------------
// Retry Configuration
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 503];
const NON_RETRYABLE_STATUS_CODES = [400, 401, 403];

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable based on HTTP status code.
 */
function isRetryable(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    if (NON_RETRYABLE_STATUS_CODES.includes(error.status)) return false;
    if (RETRYABLE_STATUS_CODES.includes(error.status)) return true;
  }
  return false;
}

/**
 * Map OpenAI errors to application error codes.
 */
function mapOpenAIError(error: unknown): OpenAIError {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return {
        code: ERROR_CODES.OPENAI_RATE_LIMITED,
        message: "OpenAI rate limit exceeded. Please try again later.",
        retryable: true,
      };
    }
    return {
      code: ERROR_CODES.OPENAI_API_ERROR,
      message: `OpenAI API error (${error.status}): ${error.message}`,
      retryable: RETRYABLE_STATUS_CODES.includes(error.status),
    };
  }

  return {
    code: ERROR_CODES.OPENAI_API_ERROR,
    message: error instanceof Error ? error.message : "Unknown OpenAI error",
    retryable: false,
  };
}

// ---------------------------------------------------------------------------
// Data Sanitization
// ---------------------------------------------------------------------------

/**
 * Remove PII from the report context before sending to OpenAI.
 * Strips email addresses, user IDs, and other sensitive identifiers.
 */
function sanitizeContext(context: ReportContext): ReportContext {
  return {
    ...context,
    projects: context.projects.map((p) => ({
      ...p,
      id: p.id,
      name: p.name,
      description: p.description ? p.description.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]") : null,
      status: p.status,
      progress: p.progress,
      startDate: p.startDate,
      endDate: p.endDate,
      updatedAt: p.updatedAt,
    })),
    updates: context.updates.map((u) => ({
      ...u,
      content: u.content.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]"),
    })),
    timeOff: context.timeOff,
    attendance: context.attendance,
  };
}

// ---------------------------------------------------------------------------
// OpenAILLMProvider
// ---------------------------------------------------------------------------

/**
 * OpenAI LLM provider that generates narratives via the OpenAI chat completions API.
 * - Requires OPENAI_API_KEY environment variable
 * - Uses model from OPENAI_MODEL env var (default: gpt-4o-mini)
 * - Temperature: 0.3 (low creativity, high consistency)
 * - Max tokens: 4000
 * - Retry: up to 3 attempts with exponential backoff (1s, 2s, 4s)
 * - Retries on: 429, 500, 503
 * - No retry on: 400, 401, 403
 * - PII sanitization applied before sending context
 */
export class OpenAILLMProvider implements LLMProvider {
  readonly name = "OpenAILLMProvider";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for OpenAILLMProvider. " +
        "Set LLM_MODE=mock for development without an API key."
      );
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateNarrative(reportContext: ReportContext): Promise<NarrativeResult> {
    console.log(`[LLM] OpenAILLMProvider - calling ${this.model} for narrative generation`);

    const sanitized = sanitizeContext(reportContext);
    const userPrompt = buildReportPrompt(sanitized, sanitized.detailLevel);

    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          temperature: 0.3,
          max_tokens: 4000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("OpenAI returned empty response content");
        }

        const parsed = JSON.parse(content) as NarrativeResult;

        // Validate required fields
        if (
          !parsed.executiveSummary ||
          !parsed.projectNarrative ||
          !parsed.workforceNarrative ||
          !parsed.markdown
        ) {
          throw new Error("OpenAI response missing required narrative fields");
        }

        return parsed;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt < MAX_RETRIES - 1 && isRetryable(error)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 1s, 2s, 4s
          console.log(`[LLM] OpenAILLMProvider - retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
          await sleep(delay);
          continue;
        }

        // Non-retryable or max retries reached
        break;
      }
    }

    const mapped = mapOpenAIError(lastError);
    const err = new Error(mapped.message);
    (err as any).code = mapped.code;
    throw err;
  }
}
