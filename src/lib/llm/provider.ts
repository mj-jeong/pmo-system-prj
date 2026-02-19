// PMO System - LLM Provider Interface
// Defines the provider abstraction for LLM narrative generation.
// Supports multiple implementations: Mock, OpenAI, and future providers.
// All providers MUST implement the LLMProvider interface.

import type { ReportContext } from "@/lib/ai/prompts";

// ---------------------------------------------------------------------------
// LLM Mode
// ---------------------------------------------------------------------------

/**
 * Available LLM operation modes.
 * - mock: Always use MockLLMProvider, no API key needed, $0 cost
 * - real: Always use OpenAILLMProvider, API key required, fails if missing
 * - auto: Use OpenAI if key available, fallback to Mock if not
 */
export type LLMMode = "mock" | "real" | "auto";

// ---------------------------------------------------------------------------
// Narrative Result (canonical definition - re-exported from openai-client)
// ---------------------------------------------------------------------------

/**
 * Result of LLM narrative generation.
 * All providers MUST return this exact shape.
 */
export interface NarrativeResult {
  executiveSummary: string;
  projectNarrative: string;
  workforceNarrative: string;
  markdown: string;
}

// ---------------------------------------------------------------------------
// LLM Provider Interface
// ---------------------------------------------------------------------------

/**
 * Interface that all LLM providers must implement.
 * Provides a single `generateNarrative()` method that accepts a ReportContext
 * and returns a NarrativeResult.
 */
export interface LLMProvider {
  /** Human-readable name of this provider (e.g., "MockLLMProvider", "OpenAILLMProvider") */
  readonly name: string;

  /**
   * Generate narrative report content from the provided report context.
   * @param reportContext - Sanitized report context with project, attendance, and analysis data.
   * @returns NarrativeResult with executive summary, project narrative, workforce narrative, and full markdown.
   */
  generateNarrative(reportContext: ReportContext): Promise<NarrativeResult>;
}

// ---------------------------------------------------------------------------
// LLM Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for LLM provider selection and behavior.
 */
export interface LLMConfig {
  /** The resolved LLM mode (after CI/env/legacy logic) */
  mode: LLMMode;
  /** Whether the current environment is CI */
  isCI: boolean;
  /** Whether OPENAI_API_KEY is available */
  hasApiKey: boolean;
  /** The selected provider name */
  providerName: string;
}

// ---------------------------------------------------------------------------
// Validation Types
// ---------------------------------------------------------------------------

/**
 * Result of narrative output validation.
 */
export interface ValidationResult {
  /** Whether the narrative passed all validation checks */
  valid: boolean;
  /** List of validation errors if not valid */
  errors: ValidationError[];
}

/**
 * Individual validation error with details.
 */
export interface ValidationError {
  /** Validation rule that failed */
  rule: string;
  /** Human-readable description of the failure */
  message: string;
  /** The section or field that failed validation, if applicable */
  section?: string;
}
