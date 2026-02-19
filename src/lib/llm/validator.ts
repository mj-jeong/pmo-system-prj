// PMO System - LLM Output Validation Layer
// Validates that narrative output meets required quality standards.
// Checks for 7 required sections, markdown table presence, and length limits.
// Supports retry on validation failure (1 retry with enhanced prompt).

import type { ReportContext } from "@/lib/ai/prompts";
import type { LLMProvider, NarrativeResult, ValidationResult, ValidationError } from "./provider";

// ---------------------------------------------------------------------------
// Required Sections (7)
// ---------------------------------------------------------------------------

/**
 * The 7 required sections that MUST appear in every generated report.
 * Validated by case-insensitive heading match in the markdown field.
 */
const REQUIRED_SECTIONS = [
  "Executive Summary",
  "Project Highlights",
  "Risks & Blockers",
  "Progress Snapshot",
  "Workforce & Availability",
  "Next Week Plan",
  "Appendix: Data Sources",
] as const;

// ---------------------------------------------------------------------------
// Validation Limits
// ---------------------------------------------------------------------------

/** Maximum number of lines allowed in the markdown output */
const MAX_LINES = 500;

/** Maximum number of characters allowed in the markdown output */
const MAX_CHARS = 50_000;

// ---------------------------------------------------------------------------
// Validation Functions
// ---------------------------------------------------------------------------

/**
 * Check if a section heading exists in the markdown content.
 * Matches ## or # headings, case-insensitive.
 */
function sectionExists(markdown: string, sectionName: string): boolean {
  // Match markdown headings: # Section, ## Section, ### Section
  // Case-insensitive, allows extra whitespace
  const pattern = new RegExp(`^#{1,3}\\s+${escapeRegExp(sectionName)}`, "im");
  return pattern.test(markdown);
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if the Progress Snapshot section contains at least one markdown table.
 * A markdown table is identified by lines containing pipe characters with content.
 */
function hasMarkdownTable(markdown: string): boolean {
  // Look for a table pattern: at least one line with | separators
  // Must have at least header row + separator row
  const tablePattern = /\|.*\|.*\|[\s\S]*?\|[-:|\s]+\|/;
  return tablePattern.test(markdown);
}

/**
 * Validate a NarrativeResult against all quality rules.
 *
 * Rules:
 * 1. All 7 required sections must exist in markdown
 * 2. Progress Snapshot must contain at least one markdown table
 * 3. Markdown must be <= 500 lines
 * 4. Markdown must be <= 50,000 characters
 *
 * @param result - The narrative result to validate
 * @returns ValidationResult with valid flag and any errors
 */
export function validateNarrative(result: NarrativeResult): ValidationResult {
  const errors: ValidationError[] = [];
  const markdown = result.markdown;

  // Rule 1: Check required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!sectionExists(markdown, section)) {
      errors.push({
        rule: "required_section",
        message: `Missing required section: "${section}"`,
        section,
      });
    }
  }

  // Rule 2: Check for markdown table in Progress Snapshot
  if (sectionExists(markdown, "Progress Snapshot") && !hasMarkdownTable(markdown)) {
    errors.push({
      rule: "table_required",
      message: 'Progress Snapshot section must contain at least one markdown table',
      section: "Progress Snapshot",
    });
  }

  // Rule 3: Check line count
  const lineCount = markdown.split("\n").length;
  if (lineCount > MAX_LINES) {
    errors.push({
      rule: "max_lines",
      message: `Markdown exceeds ${MAX_LINES} line limit (found ${lineCount} lines)`,
    });
  }

  // Rule 4: Check character count
  if (markdown.length > MAX_CHARS) {
    errors.push({
      rule: "max_chars",
      message: `Markdown exceeds ${MAX_CHARS} character limit (found ${markdown.length} characters)`,
    });
  }

  // Rule 5: Basic field presence
  if (!result.executiveSummary || result.executiveSummary.trim().length === 0) {
    errors.push({
      rule: "field_required",
      message: "executiveSummary field is empty or missing",
      section: "executiveSummary",
    });
  }
  if (!result.projectNarrative || result.projectNarrative.trim().length === 0) {
    errors.push({
      rule: "field_required",
      message: "projectNarrative field is empty or missing",
      section: "projectNarrative",
    });
  }
  if (!result.workforceNarrative || result.workforceNarrative.trim().length === 0) {
    errors.push({
      rule: "field_required",
      message: "workforceNarrative field is empty or missing",
      section: "workforceNarrative",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Validate with Retry
// ---------------------------------------------------------------------------

/**
 * Generate a narrative and validate the output. If validation fails,
 * retry once with the same provider.
 *
 * Flow:
 * 1. Generate narrative using provider
 * 2. Validate the output
 * 3. If invalid and retries remaining, log warnings and retry
 * 4. If still invalid after retry, throw error with validation details
 *
 * @param provider - The LLM provider to use for generation
 * @param context - The report context for narrative generation
 * @param maxRetries - Maximum number of retries on validation failure (default: 1)
 * @returns Validated NarrativeResult
 * @throws Error with validation details if all attempts fail validation
 */
export async function validateWithRetry(
  provider: LLMProvider,
  context: ReportContext,
  maxRetries: number = 1
): Promise<NarrativeResult> {
  let lastValidation: ValidationResult | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await provider.generateNarrative(context);
    const validation = validateNarrative(result);

    if (validation.valid) {
      if (attempt > 0) {
        console.log(`[LLM] Validation passed on retry attempt ${attempt}`);
      }
      return result;
    }

    lastValidation = validation;

    if (attempt < maxRetries) {
      console.warn(
        `[LLM] Validation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`,
        validation.errors.map((e) => e.message)
      );
    }
  }

  // All attempts failed validation
  const errorMessages = lastValidation?.errors.map((e) => e.message).join("; ") || "Unknown validation error";
  const err = new Error(`LLM output validation failed after ${maxRetries + 1} attempt(s): ${errorMessages}`);
  (err as any).code = "LLM_VALIDATION_FAILED";
  (err as any).validationErrors = lastValidation?.errors || [];
  throw err;
}
