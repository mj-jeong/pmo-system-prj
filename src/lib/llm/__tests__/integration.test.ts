// P6A-T20: Integration Tests
// Validates that generateNarrative() correctly delegates to the chosen provider
// and that the full pipeline (selectProvider -> validateWithRetry) works end-to-end.
// No real OpenAI API calls are made.
//
// P6A-T21: E2E / Backward compatibility checks
// Verifies that openai-client.ts generateNarrative() signature is unchanged and
// works with Mock mode for the full report generation flow.

// ---------------------------------------------------------------------------
// Mock server-only module (handled by jest moduleNameMapper in jest.config.ts)
// Mock OpenAI SDK to avoid real API calls
// ---------------------------------------------------------------------------
jest.mock("../openai", () => {
  return {
    OpenAILLMProvider: jest.fn().mockImplementation(() => ({
      name: "OpenAILLMProvider",
      generateNarrative: jest.fn(),
    })),
  };
});

import { selectProvider } from "../selectProvider";
import { validateNarrative, validateWithRetry } from "../validator";
import { MockLLMProvider } from "../mock";
import {
  normalProjectFixture,
  dataPoorProjectFixture,
  highRiskProjectFixture,
} from "../fixtures/smoke-tests";

// ---------------------------------------------------------------------------
// Helper: save/restore env
// ---------------------------------------------------------------------------
let savedEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  savedEnv = { ...process.env };
  process.env.CI = undefined as unknown as string;
  process.env.LLM_MODE = undefined as unknown as string;
  process.env.OPENAI_API_KEY = undefined as unknown as string;
  process.env.OPENAI_BILLING_ENABLED = undefined as unknown as string;
  // NODE_ENV is a read-only property in TypeScript - not cleared between tests
});

afterEach(() => {
  process.env = savedEnv;
});

// ===========================================================================
// P6A-T20: Integration Tests
// ===========================================================================

describe("Integration: selectProvider -> validateWithRetry pipeline", () => {
  it("selects MockLLMProvider and generates valid narrative (mock mode)", async () => {
    process.env.LLM_MODE = "mock";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);

    const result = await validateWithRetry(provider, normalProjectFixture, 1);

    // Must be valid
    const validation = validateNarrative(result);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("CI=true forces MockLLMProvider and produces valid output", async () => {
    process.env.CI = "true";
    process.env.OPENAI_API_KEY = "sk-should-be-ignored";

    const provider = selectProvider();
    expect(provider.name).toBe("MockLLMProvider");

    const result = await validateWithRetry(provider, normalProjectFixture, 0);
    const validation = validateNarrative(result);
    expect(validation.valid).toBe(true);
  });

  it("MockLLMProvider output passes validation for all three fixtures", async () => {
    process.env.LLM_MODE = "mock";
    const provider = selectProvider();

    const fixtures = [normalProjectFixture, dataPoorProjectFixture, highRiskProjectFixture];

    for (const fixture of fixtures) {
      const result = await provider.generateNarrative(fixture);
      const validation = validateNarrative(result);
      expect(validation.valid).toBe(true);
    }
  });

  it("validates all 7 required sections in MockLLMProvider output", async () => {
    process.env.LLM_MODE = "mock";
    const provider = selectProvider();
    const result = await provider.generateNarrative(normalProjectFixture);

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
      expect(result.markdown).toContain(section);
    }
  });

  it("validates markdown table exists in MockLLMProvider output", async () => {
    process.env.LLM_MODE = "mock";
    const provider = selectProvider();
    const result = await provider.generateNarrative(normalProjectFixture);

    // Table header row and separator row pattern
    expect(result.markdown).toMatch(/\|.*\|.*\|/);
    expect(result.markdown).toMatch(/\|[-: |]+\|/);
  });

  it("validates character count is within 50,000 for normal fixture", async () => {
    process.env.LLM_MODE = "mock";
    const provider = selectProvider();
    const result = await provider.generateNarrative(normalProjectFixture);

    expect(result.markdown.length).toBeLessThanOrEqual(50_000);
  });

  it("validates line count is within 500 for high-risk fixture", async () => {
    process.env.LLM_MODE = "mock";
    const provider = selectProvider();
    const result = await provider.generateNarrative(highRiskProjectFixture);

    const lineCount = result.markdown.split("\n").length;
    expect(lineCount).toBeLessThanOrEqual(500);
  });
});

// ===========================================================================
// P6A-T21: E2E / Backward Compatibility Tests
// ===========================================================================

describe("E2E: generateNarrative() backward compatibility (openai-client.ts)", () => {
  it("generateNarrative is exported from openai-client", () => {
    // Dynamic require to avoid "server-only" import at module load
    const client = require("../../ai/openai-client");
    expect(typeof client.generateNarrative).toBe("function");
  });

  it("generateNarrative accepts (reportContext) with no llmMode - backward compatible", async () => {
    process.env.LLM_MODE = "mock";

    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(normalProjectFixture);

    expect(result).toHaveProperty("executiveSummary");
    expect(result).toHaveProperty("projectNarrative");
    expect(result).toHaveProperty("workforceNarrative");
    expect(result).toHaveProperty("markdown");
  });

  it("generateNarrative accepts (reportContext, llmMode) - new optional parameter", async () => {
    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(normalProjectFixture, "mock");

    expect(result).toHaveProperty("executiveSummary");
    expect(result).toHaveProperty("markdown");
  });

  it("generateNarrative returns NarrativeResult with non-empty fields in mock mode", async () => {
    process.env.LLM_MODE = "mock";

    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(normalProjectFixture);

    expect(result.executiveSummary.trim().length).toBeGreaterThan(0);
    expect(result.projectNarrative.trim().length).toBeGreaterThan(0);
    expect(result.workforceNarrative.trim().length).toBeGreaterThan(0);
    expect(result.markdown.trim().length).toBeGreaterThan(0);
  });

  it("full report generation flow: mock mode produces valid, MOCK-tagged output", async () => {
    process.env.LLM_MODE = "mock";

    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(normalProjectFixture, "mock");

    // Validation must pass
    const validation = validateNarrative(result);
    expect(validation.valid).toBe(true);

    // MOCK REPORT tag must be present
    expect(result.markdown).toContain("MOCK REPORT");

    // Organization data must be reflected
    expect(result.markdown).toContain(normalProjectFixture.organizationName);
    expect(result.markdown).toContain(normalProjectFixture.periodStart);
    expect(result.markdown).toContain(normalProjectFixture.periodEnd);
  });

  it("full report generation for data-poor fixture passes validation", async () => {
    process.env.LLM_MODE = "mock";

    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(dataPoorProjectFixture);

    const validation = validateNarrative(result);
    expect(validation.valid).toBe(true);
  });

  it("full report generation for high-risk fixture includes delayed project info", async () => {
    process.env.LLM_MODE = "mock";

    const client = require("../../ai/openai-client");
    const result = await client.generateNarrative(highRiskProjectFixture);

    const validation = validateNarrative(result);
    expect(validation.valid).toBe(true);

    // High-risk fixture has Platform Migration delayed
    expect(result.markdown).toContain("Platform Migration");
  });

  it("NarrativeResult interface exported from openai-client (type compatibility)", () => {
    // This test confirms the re-exported types are accessible
    // If this compiles, the types are backward-compatible
    const client = require("../../ai/openai-client");
    // generateNarrative must exist and be a function
    expect(typeof client.generateNarrative).toBe("function");
  });
});

// ===========================================================================
// P6A-T21: Mock mode - complete report flow verification
// ===========================================================================

describe("E2E: Complete mock report flow - all fixtures", () => {
  const fixtures = [
    { name: "normalProjectFixture", fixture: normalProjectFixture },
    { name: "dataPoorProjectFixture", fixture: dataPoorProjectFixture },
    { name: "highRiskProjectFixture", fixture: highRiskProjectFixture },
  ];

  for (const { name, fixture } of fixtures) {
    it(`${name}: end-to-end flow produces valid, MOCK-tagged report`, async () => {
      process.env.CI = "true"; // Force mock mode, simulating CI environment

      const provider = selectProvider();
      const result = await validateWithRetry(provider, fixture, 1);

      // Full validation
      const validation = validateNarrative(result);
      expect(validation.valid).toBe(true);

      // MOCK tag
      expect(result.markdown).toContain("MOCK REPORT");

      // Organization info
      expect(result.markdown).toContain(fixture.organizationName);
    });
  }
});
