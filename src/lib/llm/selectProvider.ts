// PMO System - LLM Provider Selection
// Determines which LLM provider to use based on environment configuration.
// Priority order: CI -> runtime parameter -> LLM_MODE env -> OPENAI_BILLING_ENABLED (legacy) -> default (Mock)

import type { LLMProvider, LLMMode, LLMConfig } from "./provider";
import { MockLLMProvider } from "./mock";

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------

/**
 * Check if running in a CI environment (GitHub Actions, GitLab CI, etc.)
 * CI environments ALWAYS force Mock mode to prevent API costs.
 */
function isCI(): boolean {
  return process.env.CI === "true";
}

/**
 * Check if running in development environment.
 * Only development environments can use runtime mode overrides.
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if an OpenAI API key is available.
 */
function hasApiKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return typeof key === "string" && key.length > 0;
}

/**
 * Resolve the effective LLM mode from environment variables.
 * Priority: CI -> LLM_MODE -> OPENAI_BILLING_ENABLED (legacy) -> default("auto")
 */
function resolveMode(runtimeMode?: LLMMode): LLMMode {
  // Highest priority: CI always forces mock
  if (isCI()) {
    return "mock";
  }

  // Runtime override (dev environment only)
  if (runtimeMode && isDevelopment()) {
    return runtimeMode;
  }

  // LLM_MODE environment variable (new, recommended)
  const llmMode = process.env.LLM_MODE;
  if (llmMode === "mock" || llmMode === "real" || llmMode === "auto") {
    return llmMode;
  }

  // Legacy: OPENAI_BILLING_ENABLED
  const billingEnabled = process.env.OPENAI_BILLING_ENABLED;
  if (billingEnabled === "true") {
    return "real";
  }
  if (billingEnabled === "false") {
    return "mock";
  }

  // Default: auto
  return "auto";
}

// ---------------------------------------------------------------------------
// Provider Factory
// ---------------------------------------------------------------------------

/**
 * Select and instantiate the appropriate LLM provider based on environment configuration.
 *
 * Mode Resolution (priority order):
 * 1. CI=true -> Always MockLLMProvider (zero cost in CI)
 * 2. runtimeMode parameter (dev environment only)
 * 3. LLM_MODE env var (mock|real|auto)
 * 4. OPENAI_BILLING_ENABLED env var (legacy, true=real, false=mock)
 * 5. Default: auto (Real if key available, Mock otherwise)
 *
 * @param runtimeMode - Optional runtime override (only honored in development)
 * @returns Configured LLMProvider instance
 * @throws Error if mode is "real" but no OPENAI_API_KEY is available
 */
export function selectProvider(runtimeMode?: LLMMode): LLMProvider {
  const mode = resolveMode(runtimeMode);

  switch (mode) {
    case "mock": {
      if (isCI()) {
        console.log("[LLM] CI environment detected, forcing MockLLMProvider");
      } else {
        console.log("[LLM] Using MockLLMProvider (LLM_MODE=mock)");
      }
      return new MockLLMProvider();
    }

    case "real": {
      if (!hasApiKey()) {
        throw new Error(
          "LLM_MODE=real requires OPENAI_API_KEY. " +
          "Provide a valid API key or set LLM_MODE=mock for development."
        );
      }
      console.log("[LLM] Using OpenAILLMProvider (LLM_MODE=real)");
      // Dynamic import to avoid loading OpenAI SDK when not needed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OpenAILLMProvider } = require("./openai") as { OpenAILLMProvider: new () => LLMProvider };
      return new OpenAILLMProvider();
    }

    case "auto": {
      if (hasApiKey()) {
        console.log("[LLM] Using OpenAILLMProvider (LLM_MODE=auto, API key found)");
        // Dynamic import to avoid loading OpenAI SDK when not needed
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { OpenAILLMProvider } = require("./openai") as { OpenAILLMProvider: new () => LLMProvider };
        return new OpenAILLMProvider();
      }
      console.log("[LLM] Using MockLLMProvider (LLM_MODE=auto, no API key - graceful fallback)");
      return new MockLLMProvider();
    }

    default: {
      console.log("[LLM] Unknown mode, defaulting to MockLLMProvider");
      return new MockLLMProvider();
    }
  }
}

/**
 * Get the current LLM configuration for diagnostics/logging.
 */
export function getLLMConfig(runtimeMode?: LLMMode): LLMConfig {
  const mode = resolveMode(runtimeMode);
  const ciDetected = isCI();
  const keyAvailable = hasApiKey();

  let providerName: string;
  if (mode === "mock" || (mode === "auto" && !keyAvailable)) {
    providerName = "MockLLMProvider";
  } else {
    providerName = "OpenAILLMProvider";
  }

  return {
    mode,
    isCI: ciDetected,
    hasApiKey: keyAvailable,
    providerName,
  };
}
