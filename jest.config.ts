import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Module name mapper for Next.js path aliases and server-only stub
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Stub out "server-only" so Jest can import server modules
    "^server-only$": "<rootDir>/src/__mocks__/server-only.ts",
  },
  // Only look for tests inside __tests__ directories or *.test.ts files
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
  ],
  // Transform TypeScript files with ts-jest
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Use CommonJS modules for Jest
          module: "commonjs",
          // Relax strict settings that are incompatible with test code
          strictNullChecks: false,
          noImplicitAny: false,
        },
      },
    ],
  },
  // Collect coverage from LLM module source files
  collectCoverageFrom: [
    "src/lib/llm/**/*.ts",
    "!src/lib/llm/fixtures/**",
    "!src/lib/llm/__tests__/**",
  ],
  // Increase timeout for async tests
  testTimeout: 15000,
};

export default config;
