// P6A-T19: OpenAILLMProvider Unit Tests (with mocking)
// Tests: API key validation, retry logic (429), PII filtering.
// All OpenAI API calls are mocked - no real network requests.

// ---------------------------------------------------------------------------
// Mock the openai SDK before any imports that use it
// ---------------------------------------------------------------------------
const mockCreate = jest.fn();

jest.mock("openai", () => {
  // Build a minimal OpenAI.APIError-compatible class
  class MockAPIError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "APIError";
      this.status = status;
    }
  }

  const mockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));

  // Attach APIError class as a static on the mock constructor
  (mockOpenAI as any).APIError = MockAPIError;

  return {
    __esModule: true,
    default: mockOpenAI,
  };
});

import OpenAI from "openai";
import { normalProjectFixture } from "../fixtures/smoke-tests";

// ---------------------------------------------------------------------------
// Helper: valid OpenAI API response
// ---------------------------------------------------------------------------
function buildMockAPIResponse(overrides: Partial<{
  executiveSummary: string;
  projectNarrative: string;
  workforceNarrative: string;
  markdown: string;
}> = {}) {
  const narrative = {
    executiveSummary: "Executive summary content",
    projectNarrative: "Project narrative content",
    workforceNarrative: "Workforce narrative content",
    markdown: "# Report\n## Executive Summary\nContent here.",
    ...overrides,
  };

  return {
    choices: [
      {
        message: {
          content: JSON.stringify(narrative),
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OpenAILLMProvider", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    mockCreate.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // -------------------------------------------------------------------------
  // Constructor: API key validation
  // -------------------------------------------------------------------------

  describe("constructor - API key validation", () => {
    it("throws when OPENAI_API_KEY is not set", () => {
      delete process.env.OPENAI_API_KEY;

      // Import dynamically so the constructor runs with the current env state
      const { OpenAILLMProvider } = require("../openai");

      expect(() => new OpenAILLMProvider()).toThrow(/OPENAI_API_KEY/i);
    });

    it("throws error that mentions LLM_MODE=mock as alternative", () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAILLMProvider } = require("../openai");

      expect(() => new OpenAILLMProvider()).toThrow(/LLM_MODE=mock/i);
    });

    it("constructs successfully when OPENAI_API_KEY is set", () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      const { OpenAILLMProvider } = require("../openai");

      expect(() => new OpenAILLMProvider()).not.toThrow();
    });

    it("has name 'OpenAILLMProvider'", () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      expect(provider.name).toBe("OpenAILLMProvider");
    });
  });

  // -------------------------------------------------------------------------
  // generateNarrative: successful response
  // -------------------------------------------------------------------------

  describe("generateNarrative - success", () => {
    it("returns NarrativeResult on successful API call", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      const result = await provider.generateNarrative(normalProjectFixture);

      expect(result).toHaveProperty("executiveSummary");
      expect(result).toHaveProperty("projectNarrative");
      expect(result).toHaveProperty("workforceNarrative");
      expect(result).toHaveProperty("markdown");
    });

    it("calls OpenAI chat completions API once on success", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await provider.generateNarrative(normalProjectFixture);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("uses gpt-4o-mini as default model", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      delete process.env.OPENAI_MODEL;
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await provider.generateNarrative(normalProjectFixture);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: "gpt-4o-mini" })
      );
    });

    it("requests json_object response format", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await provider.generateNarrative(normalProjectFixture);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ response_format: { type: "json_object" } })
      );
    });
  });

  // -------------------------------------------------------------------------
  // generateNarrative: retry logic on 429
  // -------------------------------------------------------------------------

  describe("generateNarrative - retry logic", () => {
    it("retries on 429 rate limit error", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      // Mock the timers to skip actual delays
      jest.useFakeTimers();

      const RateLimitError = new (OpenAI as any).APIError("Rate limited", 429);

      // First two calls fail with 429, third succeeds
      mockCreate
        .mockRejectedValueOnce(RateLimitError)
        .mockRejectedValueOnce(RateLimitError)
        .mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      const resultPromise = provider.generateNarrative(normalProjectFixture);

      // Advance timers to handle the sleep() calls in retry logic
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toHaveProperty("executiveSummary");
      expect(mockCreate).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it("does not retry on 401 authentication error", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      const AuthError = new (OpenAI as any).APIError("Unauthorized", 401);
      mockCreate.mockRejectedValue(AuthError);

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await expect(provider.generateNarrative(normalProjectFixture)).rejects.toThrow();

      // Should NOT retry on 401 - only 1 call expected
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 403 forbidden error", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      const ForbiddenError = new (OpenAI as any).APIError("Forbidden", 403);
      mockCreate.mockRejectedValue(ForbiddenError);

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await expect(provider.generateNarrative(normalProjectFixture)).rejects.toThrow();

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 400 bad request error", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      const BadRequestError = new (OpenAI as any).APIError("Bad request", 400);
      mockCreate.mockRejectedValue(BadRequestError);

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await expect(provider.generateNarrative(normalProjectFixture)).rejects.toThrow();

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("retries on 500 server error", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      jest.useFakeTimers();

      const ServerError = new (OpenAI as any).APIError("Internal Server Error", 500);

      mockCreate
        .mockRejectedValueOnce(ServerError)
        .mockResolvedValueOnce(buildMockAPIResponse());

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      const resultPromise = provider.generateNarrative(normalProjectFixture);
      await jest.runAllTimersAsync();

      await resultPromise;
      expect(mockCreate).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it("exhausts all retries and throws after MAX_RETRIES=3 attempts", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      jest.useFakeTimers();

      const RateLimitError = new (OpenAI as any).APIError("Rate limited", 429);
      mockCreate.mockRejectedValue(RateLimitError);

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      // Attach a catch handler BEFORE advancing timers so the rejection is handled
      let caughtError: unknown = null;
      const resultPromise = provider
        .generateNarrative(normalProjectFixture)
        .catch((e: unknown) => { caughtError = e; });

      // Advance timers to drive all sleep() calls through the retry loop
      await jest.runAllTimersAsync();
      await resultPromise;

      jest.useRealTimers();

      expect(caughtError).not.toBeNull();
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });
  });

  // -------------------------------------------------------------------------
  // PII sanitization
  // -------------------------------------------------------------------------

  describe("generateNarrative - PII filtering", () => {
    it("sanitizes email addresses from project descriptions (sanitizeContext removes them)", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const contextWithEmail = {
        ...normalProjectFixture,
        projects: [
          {
            ...normalProjectFixture.projects[0],
            description: "Contact person.name@company.com for details",
          },
        ],
      };

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await provider.generateNarrative(contextWithEmail);

      // Verify the API was called (sanitization runs before the call)
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // The raw email must not appear anywhere in the API call
      // Note: buildReportPrompt does not include project description in the prompt,
      // but sanitizeContext replaces emails with [email] in the context before calling.
      // We verify the raw email is absent from the entire serialised call.
      const callArgs = mockCreate.mock.calls[0][0];
      const callJson = JSON.stringify(callArgs);
      expect(callJson).not.toContain("person.name@company.com");
    });

    it("strips email addresses from project update content sent to API", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      mockCreate.mockResolvedValueOnce(buildMockAPIResponse());

      const contextWithEmailInUpdate = {
        ...normalProjectFixture,
        updates: [
          {
            ...normalProjectFixture.updates[0],
            content: "Report sent to manager@example.org for review.",
          },
        ],
      };

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await provider.generateNarrative(contextWithEmailInUpdate);

      // buildReportPrompt sanitizes updates and includes content in the prompt.
      // The sanitized content should replace the email with [email].
      const callArgs = mockCreate.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === "user");
      expect(userMessage.content).not.toContain("manager@example.org");
      expect(userMessage.content).toContain("[email]");
    });
  });

  // -------------------------------------------------------------------------
  // Error mapping
  // -------------------------------------------------------------------------

  describe("generateNarrative - error mapping", () => {
    it("maps 429 to OPENAI_RATE_LIMITED error code after exhausting retries", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";
      jest.useFakeTimers();

      const RateLimitError = new (OpenAI as any).APIError("Rate limited", 429);
      mockCreate.mockRejectedValue(RateLimitError);

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      // Attach catch BEFORE advancing timers to avoid unhandled rejection
      let thrownError: unknown = null;
      const resultPromise = provider
        .generateNarrative(normalProjectFixture)
        .catch((e: unknown) => { thrownError = e; });

      await jest.runAllTimersAsync();
      await resultPromise;

      jest.useRealTimers();

      expect(thrownError).not.toBeNull();
      expect((thrownError as any).code).toBe("OPENAI_RATE_LIMITED");
    });

    it("throws when OpenAI response content is empty", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await expect(provider.generateNarrative(normalProjectFixture)).rejects.toThrow(
        /empty response/i
      );
    });

    it("throws when OpenAI response is missing required narrative fields", async () => {
      process.env.OPENAI_API_KEY = "sk-test-valid-key";

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ partial: "data" }) } }],
      });

      const { OpenAILLMProvider } = require("../openai");
      const provider = new OpenAILLMProvider();

      await expect(provider.generateNarrative(normalProjectFixture)).rejects.toThrow(
        /missing required/i
      );
    });
  });
});
