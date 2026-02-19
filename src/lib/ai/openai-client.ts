import "server-only";

// PMO System - OpenAI Client (Hybrid LLM Wrapper)
// Entry point for LLM narrative generation using the Provider pattern.
// Delegates to MockLLMProvider or OpenAILLMProvider based on environment config.
// This file MUST only be imported in server-side code (enforced by "server-only").
//
// Supported modes (LLM_MODE environment variable):
// - mock: Always Mock provider, no API key needed, $0 cost
// - real: Always OpenAI provider, requires OPENAI_API_KEY
// - auto (default): OpenAI if key available, Mock fallback
// - CI=true: Forces Mock regardless of LLM_MODE
//
// Legacy: OPENAI_BILLING_ENABLED is still supported for backward compatibility.

import type { ReportContext } from "./prompts";
import type { LLMMode } from "@/lib/llm/provider";
import { selectProvider } from "@/lib/llm/selectProvider";
import { validateWithRetry } from "@/lib/llm/validator";

// ---------------------------------------------------------------------------
// Types (re-exported for backward compatibility)
// ---------------------------------------------------------------------------

export interface NarrativeResult {
  executiveSummary: string;
  projectNarrative: string;
  workforceNarrative: string;
  markdown: string;
}

export interface OpenAIError {
  code: string;
  message: string;
  retryable: boolean;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate narrative report content from the provided report context.
 *
 * This function maintains full backward compatibility with the original API.
 * Internally delegates to the appropriate LLM provider based on environment
 * configuration and validates the output.
 *
 * Provider selection:
 * 1. CI=true -> MockLLMProvider (always, zero cost)
 * 2. LLM_MODE=mock -> MockLLMProvider
 * 3. LLM_MODE=real -> OpenAILLMProvider (requires API key)
 * 4. LLM_MODE=auto -> OpenAI if key available, Mock otherwise
 * 5. OPENAI_BILLING_ENABLED=true/false (legacy fallback)
 *
 * Output validation:
 * - 7 required sections checked
 * - Progress Snapshot markdown table required
 * - Max 500 lines, 50k characters
 * - 1 retry on validation failure
 *
 * @param reportContext - Sanitized report context with project data
 * @param llmMode - Optional runtime mode override (development only)
 * @returns NarrativeResult with executive summary, project narrative, workforce narrative, and full markdown
 */
export async function generateNarrative(
  reportContext: ReportContext,
  llmMode?: LLMMode
): Promise<NarrativeResult> {
  const provider = selectProvider(llmMode);
  return validateWithRetry(provider, reportContext, 1);
}
