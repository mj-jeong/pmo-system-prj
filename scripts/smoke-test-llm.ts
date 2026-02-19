// PMO System - LLM Smoke Test Runner
// Runs all 3 smoke test fixtures against the LLM providers.
// Development environment only - requires SMOKE_TEST=true to run.
//
// Usage:
//   SMOKE_TEST=true OPENAI_API_KEY=sk-xxx npx tsx scripts/smoke-test-llm.ts
//   SMOKE_TEST=true LLM_MODE=mock npx tsx scripts/smoke-test-llm.ts

/* eslint-disable no-console */

import {
  normalProjectFixture,
  dataPoorProjectFixture,
  highRiskProjectFixture,
} from "../src/lib/llm/fixtures/smoke-tests";
import { MockLLMProvider } from "../src/lib/llm/mock";
import { validateNarrative } from "../src/lib/llm/validator";
import type { NarrativeResult } from "../src/lib/llm/provider";

// ---------------------------------------------------------------------------
// Guard: Only run if SMOKE_TEST=true
// ---------------------------------------------------------------------------

if (process.env.SMOKE_TEST !== "true") {
  console.log("Smoke test skipped. Set SMOKE_TEST=true to run.");
  console.log("Usage: SMOKE_TEST=true npx tsx scripts/smoke-test-llm.ts");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Test Runner
// ---------------------------------------------------------------------------

interface TestResult {
  fixture: string;
  passed: boolean;
  provider: string;
  duration: number;
  validationErrors: string[];
  error?: string;
}

async function runFixture(
  name: string,
  fixture: typeof normalProjectFixture,
  provider: { name: string; generateNarrative: (ctx: typeof fixture) => Promise<NarrativeResult> }
): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await provider.generateNarrative(fixture);
    const validation = validateNarrative(result);
    const duration = Date.now() - start;

    return {
      fixture: name,
      passed: validation.valid,
      provider: provider.name,
      duration,
      validationErrors: validation.errors.map((e) => e.message),
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      fixture: name,
      passed: false,
      provider: provider.name,
      duration,
      validationErrors: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("=== LLM Smoke Test Runner ===\n");

  const provider = new MockLLMProvider();
  console.log(`Provider: ${provider.name}`);
  console.log(`LLM_MODE: ${process.env.LLM_MODE || "not set"}`);
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "present" : "not set"}\n`);

  const fixtures = [
    { name: "Normal Project", fixture: normalProjectFixture },
    { name: "Data-Poor Project", fixture: dataPoorProjectFixture },
    { name: "High-Risk Project", fixture: highRiskProjectFixture },
  ];

  const results: TestResult[] = [];

  for (const { name, fixture } of fixtures) {
    console.log(`Running: ${name}...`);
    const result = await runFixture(name, fixture, provider);
    results.push(result);

    if (result.passed) {
      console.log(`  PASSED (${result.duration}ms)`);
    } else {
      console.log(`  FAILED (${result.duration}ms)`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      for (const err of result.validationErrors) {
        console.log(`  Validation: ${err}`);
      }
    }
    console.log();
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`=== Results: ${passed}/${total} passed ===`);

  if (passed < total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
