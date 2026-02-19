// P6A-T19: MockLLMProvider Unit Tests
// Validates deterministic behavior, MOCK REPORT warning, NarrativeResult shape.

import { MockLLMProvider } from "../mock";
import type { NarrativeResult } from "../provider";
import {
  normalProjectFixture,
  dataPoorProjectFixture,
  highRiskProjectFixture,
} from "../fixtures/smoke-tests";

describe("MockLLMProvider", () => {
  let provider: MockLLMProvider;

  beforeEach(() => {
    provider = new MockLLMProvider();
  });

  // -------------------------------------------------------------------------
  // Provider identity
  // -------------------------------------------------------------------------

  it("has name 'MockLLMProvider'", () => {
    expect(provider.name).toBe("MockLLMProvider");
  });

  // -------------------------------------------------------------------------
  // NarrativeResult interface shape
  // -------------------------------------------------------------------------

  it("returns an object with the four required NarrativeResult fields", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);

    // 4 fields must be present
    expect(result).toHaveProperty("executiveSummary");
    expect(result).toHaveProperty("projectNarrative");
    expect(result).toHaveProperty("workforceNarrative");
    expect(result).toHaveProperty("markdown");

    // All fields must be non-empty strings
    expect(typeof result.executiveSummary).toBe("string");
    expect(typeof result.projectNarrative).toBe("string");
    expect(typeof result.workforceNarrative).toBe("string");
    expect(typeof result.markdown).toBe("string");

    expect(result.executiveSummary.trim().length).toBeGreaterThan(0);
    expect(result.projectNarrative.trim().length).toBeGreaterThan(0);
    expect(result.workforceNarrative.trim().length).toBeGreaterThan(0);
    expect(result.markdown.trim().length).toBeGreaterThan(0);
  });

  it("returns a Promise that resolves to NarrativeResult", async () => {
    const resultPromise = provider.generateNarrative(normalProjectFixture);
    expect(resultPromise).toBeInstanceOf(Promise);

    const result = await resultPromise;
    expect(result).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // MOCK REPORT warning must appear in all sections
  // -------------------------------------------------------------------------

  it("includes 'MOCK REPORT' warning in executiveSummary", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.executiveSummary).toContain("MOCK REPORT");
  });

  it("includes 'MOCK REPORT' warning in projectNarrative", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.projectNarrative).toContain("MOCK REPORT");
  });

  it("includes 'MOCK REPORT' warning in workforceNarrative", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.workforceNarrative).toContain("MOCK REPORT");
  });

  it("includes 'MOCK REPORT' warning in markdown", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.markdown).toContain("MOCK REPORT");
  });

  // -------------------------------------------------------------------------
  // Determinism: same input -> same output
  // -------------------------------------------------------------------------

  it("returns identical output for the same input (determinism)", async () => {
    const result1 = await provider.generateNarrative(normalProjectFixture);
    const result2 = await provider.generateNarrative(normalProjectFixture);

    expect(result1.executiveSummary).toBe(result2.executiveSummary);
    expect(result1.projectNarrative).toBe(result2.projectNarrative);
    expect(result1.workforceNarrative).toBe(result2.workforceNarrative);
    expect(result1.markdown).toBe(result2.markdown);
  });

  it("produces different output for different inputs (input sensitivity)", async () => {
    const result1 = await provider.generateNarrative(normalProjectFixture);
    const result2 = await provider.generateNarrative(highRiskProjectFixture);

    // Different organizations, so markdown must differ
    expect(result1.markdown).not.toBe(result2.markdown);
    expect(result1.executiveSummary).not.toBe(result2.executiveSummary);
  });

  // -------------------------------------------------------------------------
  // Content uses actual project data
  // -------------------------------------------------------------------------

  it("embeds organization name from context into markdown", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.markdown).toContain(normalProjectFixture.organizationName);
  });

  it("embeds period dates into markdown", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    expect(result.markdown).toContain(normalProjectFixture.periodStart);
    expect(result.markdown).toContain(normalProjectFixture.periodEnd);
  });

  it("embeds project names into projectNarrative", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    for (const project of normalProjectFixture.projects) {
      expect(result.projectNarrative).toContain(project.name);
    }
  });

  it("reflects delayed projects in output for high-risk fixture", async () => {
    const result = await provider.generateNarrative(highRiskProjectFixture);
    // High-risk fixture has "Platform Migration" as delayed
    expect(result.markdown).toContain("Platform Migration");
    expect(result.executiveSummary).toContain("delayed");
  });

  // -------------------------------------------------------------------------
  // Data-poor fixture: no updates, no delayed projects
  // -------------------------------------------------------------------------

  it("handles data-poor fixture gracefully (no updates, no anomalies)", async () => {
    const result = await provider.generateNarrative(dataPoorProjectFixture);

    // Must still return all four fields
    expect(result.executiveSummary.trim().length).toBeGreaterThan(0);
    expect(result.markdown.trim().length).toBeGreaterThan(0);

    // Update gaps should be reflected
    expect(result.markdown).toContain("MVP Launch");
  });

  // -------------------------------------------------------------------------
  // Markdown structure checks
  // -------------------------------------------------------------------------

  it("markdown contains all 7 required section headings", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    const md = result.markdown;

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
      expect(md).toContain(section);
    }
  });

  it("markdown contains a progress snapshot table", async () => {
    const result = await provider.generateNarrative(normalProjectFixture);
    // Markdown table: must have | header | and |---|---| separator rows
    expect(result.markdown).toMatch(/\|.*\|/);
    expect(result.markdown).toMatch(/\|[-: |]+\|/);
  });
});
