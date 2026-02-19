// P6A-T19: selectProvider Unit Tests
// Validates all mode selection branches:
//   CI=true -> MockProvider
//   LLM_MODE=mock -> MockProvider
//   LLM_MODE=real + key -> OpenAIProvider
//   LLM_MODE=real + no key -> Error
//   LLM_MODE=auto + key -> OpenAIProvider
//   LLM_MODE=auto + no key -> MockProvider
//   OPENAI_BILLING_ENABLED legacy behavior

// ---------------------------------------------------------------------------
// Mock the OpenAI provider module to avoid importing "server-only" and
// real OpenAI SDK during tests.
// ---------------------------------------------------------------------------
jest.mock("../openai", () => {
  return {
    OpenAILLMProvider: jest.fn().mockImplementation(() => ({
      name: "OpenAILLMProvider",
      generateNarrative: jest.fn(),
    })),
  };
});

import { selectProvider, getLLMConfig } from "../selectProvider";
import { MockLLMProvider } from "../mock";

// ---------------------------------------------------------------------------
// Helper: capture original env values and restore after each test
// ---------------------------------------------------------------------------
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // Deep-clone the relevant env keys before each test
  originalEnv = { ...process.env };

  // Clear all LLM-related variables to ensure a clean slate
  process.env.CI = undefined as unknown as string;
  // NODE_ENV is a read-only property in TypeScript - not cleared between tests
  process.env.LLM_MODE = undefined as unknown as string;
  process.env.OPENAI_API_KEY = undefined as unknown as string;
  process.env.OPENAI_BILLING_ENABLED = undefined as unknown as string;
});

afterEach(() => {
  // Restore original environment
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// CI=true -> always MockLLMProvider
// ---------------------------------------------------------------------------

describe("selectProvider - CI environment", () => {
  it("returns MockLLMProvider when CI=true regardless of LLM_MODE", () => {
    process.env.CI = "true";
    process.env.LLM_MODE = "real";
    process.env.OPENAI_API_KEY = "sk-test-key";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
    expect(provider.name).toBe("MockLLMProvider");
  });

  it("returns MockLLMProvider when CI=true even without API key", () => {
    process.env.CI = "true";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });

  it("returns MockLLMProvider when CI=true and LLM_MODE=auto", () => {
    process.env.CI = "true";
    process.env.LLM_MODE = "auto";
    process.env.OPENAI_API_KEY = "sk-test-key";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });
});

// ---------------------------------------------------------------------------
// LLM_MODE=mock
// ---------------------------------------------------------------------------

describe("selectProvider - LLM_MODE=mock", () => {
  it("returns MockLLMProvider when LLM_MODE=mock", () => {
    process.env.LLM_MODE = "mock";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
    expect(provider.name).toBe("MockLLMProvider");
  });

  it("returns MockLLMProvider when LLM_MODE=mock even if API key is set", () => {
    process.env.LLM_MODE = "mock";
    process.env.OPENAI_API_KEY = "sk-should-not-matter";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });
});

// ---------------------------------------------------------------------------
// LLM_MODE=real
// ---------------------------------------------------------------------------

describe("selectProvider - LLM_MODE=real", () => {
  it("returns OpenAILLMProvider when LLM_MODE=real and API key is present", () => {
    process.env.LLM_MODE = "real";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider.name).toBe("OpenAILLMProvider");
  });

  it("throws when LLM_MODE=real but no OPENAI_API_KEY", () => {
    process.env.LLM_MODE = "real";

    expect(() => selectProvider()).toThrow(/OPENAI_API_KEY/i);
  });

  it("thrown error message mentions LLM_MODE=mock as alternative", () => {
    process.env.LLM_MODE = "real";

    expect(() => selectProvider()).toThrow(/LLM_MODE=mock/i);
  });
});

// ---------------------------------------------------------------------------
// LLM_MODE=auto
// ---------------------------------------------------------------------------

describe("selectProvider - LLM_MODE=auto", () => {
  it("returns OpenAILLMProvider when LLM_MODE=auto and API key is present", () => {
    process.env.LLM_MODE = "auto";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider.name).toBe("OpenAILLMProvider");
  });

  it("returns MockLLMProvider when LLM_MODE=auto and no API key (graceful fallback)", () => {
    process.env.LLM_MODE = "auto";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
    expect(provider.name).toBe("MockLLMProvider");
  });
});

// ---------------------------------------------------------------------------
// Default behavior (no env vars set)
// ---------------------------------------------------------------------------

describe("selectProvider - default (no env vars)", () => {
  it("defaults to MockLLMProvider when no env vars and no API key", () => {
    // All LLM env vars already cleared in beforeEach
    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });

  it("defaults to OpenAILLMProvider when no LLM_MODE but API key is present", () => {
    // Default is "auto" -> real if key available
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider.name).toBe("OpenAILLMProvider");
  });
});

// ---------------------------------------------------------------------------
// Legacy: OPENAI_BILLING_ENABLED
// ---------------------------------------------------------------------------

describe("selectProvider - legacy OPENAI_BILLING_ENABLED", () => {
  it("uses real mode when OPENAI_BILLING_ENABLED=true and API key present", () => {
    process.env.OPENAI_BILLING_ENABLED = "true";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider.name).toBe("OpenAILLMProvider");
  });

  it("uses mock mode when OPENAI_BILLING_ENABLED=false", () => {
    process.env.OPENAI_BILLING_ENABLED = "false";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });

  it("OPENAI_BILLING_ENABLED=true without API key throws error", () => {
    process.env.OPENAI_BILLING_ENABLED = "true";
    // No OPENAI_API_KEY set

    expect(() => selectProvider()).toThrow(/OPENAI_API_KEY/i);
  });

  it("LLM_MODE takes priority over OPENAI_BILLING_ENABLED", () => {
    // LLM_MODE=mock should win over OPENAI_BILLING_ENABLED=true
    process.env.LLM_MODE = "mock";
    process.env.OPENAI_BILLING_ENABLED = "true";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const provider = selectProvider();
    expect(provider).toBeInstanceOf(MockLLMProvider);
  });
});

// ---------------------------------------------------------------------------
// getLLMConfig diagnostics
// ---------------------------------------------------------------------------

describe("getLLMConfig", () => {
  it("returns config with mode, isCI, hasApiKey, providerName", () => {
    process.env.LLM_MODE = "mock";

    const config = getLLMConfig();
    expect(config).toHaveProperty("mode");
    expect(config).toHaveProperty("isCI");
    expect(config).toHaveProperty("hasApiKey");
    expect(config).toHaveProperty("providerName");
  });

  it("reports MockLLMProvider when LLM_MODE=mock", () => {
    process.env.LLM_MODE = "mock";

    const config = getLLMConfig();
    expect(config.mode).toBe("mock");
    expect(config.providerName).toBe("MockLLMProvider");
  });

  it("reports OpenAILLMProvider when LLM_MODE=real with key", () => {
    process.env.LLM_MODE = "real";
    process.env.OPENAI_API_KEY = "sk-valid-key";

    const config = getLLMConfig();
    expect(config.mode).toBe("real");
    expect(config.providerName).toBe("OpenAILLMProvider");
    expect(config.hasApiKey).toBe(true);
  });

  it("reports isCI=true when CI env is set", () => {
    process.env.CI = "true";

    const config = getLLMConfig();
    expect(config.isCI).toBe(true);
    expect(config.providerName).toBe("MockLLMProvider");
  });

  it("reports hasApiKey=false when no API key", () => {
    process.env.LLM_MODE = "mock";

    const config = getLLMConfig();
    expect(config.hasApiKey).toBe(false);
  });
});
