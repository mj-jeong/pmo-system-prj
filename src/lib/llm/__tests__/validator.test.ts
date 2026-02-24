// P6A-T19: validateNarrative Unit Tests
// Validates section presence, table requirement, length limits, field presence.

import { validateNarrative, validateWithRetry } from "../validator";
import type { NarrativeResult } from "../provider";
import type { LLMProvider } from "../provider";
import { normalProjectFixture } from "../fixtures/smoke-tests";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid NarrativeResult that passes all validation rules */
function buildValidResult(overrides: Partial<NarrativeResult> = {}): NarrativeResult {
  const markdown = `# PMO Weekly Report: 2026-02-10 to 2026-02-16

## Executive Summary

All projects are on track this week.

## Project Highlights

Projects are progressing normally.

## Risks & Blockers

No blockers identified.

## Progress Snapshot

| Project | Status | Progress | Start Date | End Date |
|---------|--------|----------|------------|----------|
| Project Alpha | IN_PROGRESS | 65% | 2026-01-01 | 2026-03-31 |

## Workforce & Availability

Attendance rate: 90%.

## Next Week Plan

- [ ] Continue current sprint
- [ ] Review project timelines

## Appendix: Data Sources

- Projects: 1 tracked
`;

  return {
    executiveSummary: "## Executive Summary\n\nAll projects are on track.",
    projectNarrative: "## Project Highlights\n\nProject Alpha is at 65%.",
    workforceNarrative: "## Workforce & Availability\n\nAttendance: 90%.",
    markdown,
    usage: {
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
      model: "gpt-4o",
    },
    isFallback: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Valid result tests
// ---------------------------------------------------------------------------

describe("validateNarrative - valid input", () => {
  it("passes a fully valid NarrativeResult", () => {
    const result = validateNarrative(buildValidResult());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns ValidationResult with valid and errors fields", () => {
    const result = validateNarrative(buildValidResult());
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("errors");
    expect(Array.isArray(result.errors)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Required sections (7 sections must be present)
// ---------------------------------------------------------------------------

describe("validateNarrative - required sections", () => {
  const requiredSections = [
    "Executive Summary",
    "Project Highlights",
    "Risks & Blockers",
    "Progress Snapshot",
    "Workforce & Availability",
    "Next Week Plan",
    "Appendix: Data Sources",
  ];

  for (const section of requiredSections) {
    it(`fails when '${section}' section is missing from markdown`, () => {
      // Build markdown without the target section heading
      const baseResult = buildValidResult();
      const markdownWithoutSection = baseResult.markdown
        .split("\n")
        .filter((line) => !line.includes(section))
        .join("\n");

      const result = validateNarrative({ ...baseResult, markdown: markdownWithoutSection });

      expect(result.valid).toBe(false);
      const sectionError = result.errors.find((e) => e.section === section);
      expect(sectionError).toBeDefined();
      expect(sectionError?.rule).toBe("required_section");
      expect(sectionError?.message).toContain(section);
    });
  }

  it("reports all missing sections in a single call", () => {
    // Markdown with no section headings at all
    const result = validateNarrative({
      ...buildValidResult(),
      markdown: "Just some text without any headings.",
    });

    expect(result.valid).toBe(false);
    const sectionErrors = result.errors.filter((e) => e.rule === "required_section");
    expect(sectionErrors.length).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Table requirement in Progress Snapshot
// ---------------------------------------------------------------------------

describe("validateNarrative - table requirement", () => {
  it("fails when Progress Snapshot section exists but has no markdown table", () => {
    const baseResult = buildValidResult();
    // Remove the table rows from the markdown but keep the section heading
    // Replace the table block using multiline-safe pattern (no 's' flag - ES2017 target)
    const markdownWithoutTable = baseResult.markdown.replace(
      /\| Project \|[^\n]*\n\|[-: |]+\|\n\| [^\n]+\|/,
      "No table here."
    );

    const result = validateNarrative({ ...baseResult, markdown: markdownWithoutTable });

    expect(result.valid).toBe(false);
    const tableError = result.errors.find((e) => e.rule === "table_required");
    expect(tableError).toBeDefined();
    expect(tableError?.section).toBe("Progress Snapshot");
  });

  it("passes when Progress Snapshot has a markdown table", () => {
    const result = validateNarrative(buildValidResult());
    const tableError = result.errors.find((e) => e.rule === "table_required");
    expect(tableError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Length limits
// ---------------------------------------------------------------------------

describe("validateNarrative - length limits", () => {
  it("fails when markdown exceeds 500 lines", () => {
    const baseResult = buildValidResult();
    // Generate markdown with 501 lines
    const longMarkdown = baseResult.markdown + "\n".repeat(501);

    const result = validateNarrative({ ...baseResult, markdown: longMarkdown });

    expect(result.valid).toBe(false);
    const lineError = result.errors.find((e) => e.rule === "max_lines");
    expect(lineError).toBeDefined();
    expect(lineError?.message).toContain("500");
  });

  it("fails when markdown exceeds 50,000 characters", () => {
    const baseResult = buildValidResult();
    // Pad markdown to exceed the character limit
    const longMarkdown = baseResult.markdown + "x".repeat(50_000);

    const result = validateNarrative({ ...baseResult, markdown: longMarkdown });

    expect(result.valid).toBe(false);
    const charError = result.errors.find((e) => e.rule === "max_chars");
    expect(charError).toBeDefined();
    expect(charError?.message).toContain("50000");
  });

  it("passes when markdown is exactly at the 500 line boundary", () => {
    const baseResult = buildValidResult();
    // Count current lines and pad to exactly 500
    const currentLines = baseResult.markdown.split("\n").length;
    const padding = Math.max(0, 500 - currentLines);
    const exactMarkdown = baseResult.markdown + "\n".repeat(padding);

    const result = validateNarrative({ ...baseResult, markdown: exactMarkdown });
    const lineError = result.errors.find((e) => e.rule === "max_lines");
    expect(lineError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Required fields (executiveSummary, projectNarrative, workforceNarrative)
// ---------------------------------------------------------------------------

describe("validateNarrative - required field presence", () => {
  it("fails when executiveSummary is empty string", () => {
    const result = validateNarrative(buildValidResult({ executiveSummary: "" }));
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.section === "executiveSummary");
    expect(err).toBeDefined();
    expect(err?.rule).toBe("field_required");
  });

  it("fails when executiveSummary is only whitespace", () => {
    const result = validateNarrative(buildValidResult({ executiveSummary: "   \n  " }));
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.section === "executiveSummary");
    expect(err).toBeDefined();
  });

  it("fails when projectNarrative is empty string", () => {
    const result = validateNarrative(buildValidResult({ projectNarrative: "" }));
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.section === "projectNarrative");
    expect(err).toBeDefined();
    expect(err?.rule).toBe("field_required");
  });

  it("fails when workforceNarrative is empty string", () => {
    const result = validateNarrative(buildValidResult({ workforceNarrative: "" }));
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.section === "workforceNarrative");
    expect(err).toBeDefined();
    expect(err?.rule).toBe("field_required");
  });

  it("accumulates multiple field errors in a single call", () => {
    const result = validateNarrative(
      buildValidResult({ executiveSummary: "", projectNarrative: "", workforceNarrative: "" })
    );
    expect(result.valid).toBe(false);
    const fieldErrors = result.errors.filter((e) => e.rule === "field_required");
    expect(fieldErrors.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// ValidationError shape
// ---------------------------------------------------------------------------

describe("validateNarrative - ValidationError structure", () => {
  it("each error has rule, message, and optional section fields", () => {
    const result = validateNarrative({ ...buildValidResult(), markdown: "no headings" });

    expect(result.errors.length).toBeGreaterThan(0);
    for (const err of result.errors) {
      expect(typeof err.rule).toBe("string");
      expect(typeof err.message).toBe("string");
      // section is optional but when present must be a string
      if (err.section !== undefined) {
        expect(typeof err.section).toBe("string");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// validateWithRetry
// ---------------------------------------------------------------------------

describe("validateWithRetry", () => {
  it("returns result immediately when first generation is valid", async () => {
    const mockProvider: LLMProvider = {
      name: "TestProvider",
      generateNarrative: jest.fn().mockResolvedValue(buildValidResult()),
    };

    const result = await validateWithRetry(mockProvider, normalProjectFixture, 1);
    expect(result).toBeDefined();
    expect(mockProvider.generateNarrative).toHaveBeenCalledTimes(1);
  });

  it("retries once when first attempt produces invalid output", async () => {
    const invalidResult: NarrativeResult = {
      executiveSummary: "",
      projectNarrative: "",
      workforceNarrative: "",
      markdown: "too short",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, model: "gpt-4o" },
      isFallback: false,
    };
    const validResult = buildValidResult();

    const mockProvider: LLMProvider = {
      name: "TestProvider",
      generateNarrative: jest
        .fn()
        .mockResolvedValueOnce(invalidResult)
        .mockResolvedValueOnce(validResult),
    };

    const result = await validateWithRetry(mockProvider, normalProjectFixture, 1);
    expect(result).toEqual(validResult);
    expect(mockProvider.generateNarrative).toHaveBeenCalledTimes(2);
  });

  it("throws after all attempts fail validation", async () => {
    const invalidResult: NarrativeResult = {
      executiveSummary: "",
      projectNarrative: "",
      workforceNarrative: "",
      markdown: "no valid sections",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, model: "gpt-4o" },
      isFallback: false,
    };

    const mockProvider: LLMProvider = {
      name: "TestProvider",
      generateNarrative: jest.fn().mockResolvedValue(invalidResult),
    };

    await expect(
      validateWithRetry(mockProvider, normalProjectFixture, 1)
    ).rejects.toThrow(/validation failed/i);

    // 1 original + 1 retry = 2 total calls
    expect(mockProvider.generateNarrative).toHaveBeenCalledTimes(2);
  });

  it("thrown error includes validation error details", async () => {
    const invalidResult: NarrativeResult = {
      executiveSummary: "",
      projectNarrative: "",
      workforceNarrative: "",
      markdown: "no valid sections",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, model: "gpt-4o" },
      isFallback: false,
    };

    const mockProvider: LLMProvider = {
      name: "TestProvider",
      generateNarrative: jest.fn().mockResolvedValue(invalidResult),
    };

    let thrownError: Error | null = null;
    try {
      await validateWithRetry(mockProvider, normalProjectFixture, 0);
    } catch (e) {
      thrownError = e as Error;
    }

    expect(thrownError).not.toBeNull();
    expect((thrownError as any).code).toBe("LLM_VALIDATION_FAILED");
    expect((thrownError as any).validationErrors).toBeDefined();
    expect(Array.isArray((thrownError as any).validationErrors)).toBe(true);
  });
});
