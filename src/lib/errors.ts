// PMO System - Error Code Registry
// Centralized error codes for consistent API responses

export const ERROR_CODES = {
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Authentication
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Authorization
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_ROLE: "INSUFFICIENT_ROLE",

  // Multi-tenancy (CRITICAL)
  CROSS_ORG_ACCESS_DENIED: "CROSS_ORG_ACCESS_DENIED",
  ORG_NOT_FOUND: "ORG_NOT_FOUND",

  // Resource not found
  NOT_FOUND: "NOT_FOUND",
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ATTENDANCE_NOT_FOUND: "ATTENDANCE_NOT_FOUND",
  TIME_OFF_NOT_FOUND: "TIME_OFF_NOT_FOUND",

  // Conflict
  CONFLICT: "CONFLICT",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  ORG_SLUG_TAKEN: "ORG_SLUG_TAKEN",
  ATTENDANCE_ALREADY_LOGGED: "ATTENDANCE_ALREADY_LOGGED",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Agent
  AGENT_RUN_ALREADY_RUNNING: "AGENT_RUN_ALREADY_RUNNING",
  AGENT_RUN_NOT_FOUND: "AGENT_RUN_NOT_FOUND",
  AGENT_RUN_FAILED: "AGENT_RUN_FAILED",

  // Report
  REPORT_NOT_FOUND: "REPORT_NOT_FOUND",
  REPORT_ALREADY_PUBLISHED: "REPORT_ALREADY_PUBLISHED",

  // OpenAI
  OPENAI_API_ERROR: "OPENAI_API_ERROR",
  OPENAI_RATE_LIMITED: "OPENAI_RATE_LIMITED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Standard API error response format.
 * Used by all route handlers for consistent error reporting.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/**
 * Create a standardized error response.
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Array<{ field: string; message: string }>
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return Response.json(body, { status });
}

/**
 * HTTP status code mapping for common error codes.
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.SESSION_EXPIRED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INSUFFICIENT_ROLE]: 403,
  [ERROR_CODES.CROSS_ORG_ACCESS_DENIED]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.PROJECT_NOT_FOUND]: 404,
  [ERROR_CODES.USER_NOT_FOUND]: 404,
  [ERROR_CODES.ORG_NOT_FOUND]: 404,
  [ERROR_CODES.ATTENDANCE_NOT_FOUND]: 404,
  [ERROR_CODES.TIME_OFF_NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 409,
  [ERROR_CODES.ORG_SLUG_TAKEN]: 409,
  [ERROR_CODES.ATTENDANCE_ALREADY_LOGGED]: 409,
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.AGENT_RUN_ALREADY_RUNNING]: 409,
  [ERROR_CODES.AGENT_RUN_NOT_FOUND]: 404,
  [ERROR_CODES.AGENT_RUN_FAILED]: 500,
  [ERROR_CODES.REPORT_NOT_FOUND]: 404,
  [ERROR_CODES.REPORT_ALREADY_PUBLISHED]: 409,
  [ERROR_CODES.OPENAI_API_ERROR]: 502,
  [ERROR_CODES.OPENAI_RATE_LIMITED]: 503,
};
