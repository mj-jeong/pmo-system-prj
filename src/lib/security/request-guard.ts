// PMO System - Request Guard
// Validates incoming requests for security constraints:
// - Content-Type enforcement on POST/PATCH/PUT/DELETE
// - Request body size limits
// - No sensitive data in error responses

import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

/**
 * Maximum request body size in bytes (1MB).
 * Prevents large payload attacks.
 */
export const MAX_BODY_SIZE = 1_048_576; // 1MB

/**
 * HTTP methods that require Content-Type: application/json.
 */
const BODY_METHODS = new Set(["POST", "PATCH", "PUT"]);

/**
 * Validate that state-changing requests have the correct Content-Type.
 * Returns an error response if validation fails, or null if valid.
 */
export function validateContentType(request: Request): Response | null {
  const method = request.method.toUpperCase();

  if (!BODY_METHODS.has(method)) {
    return null; // GET, DELETE, OPTIONS etc. don't need Content-Type
  }

  const contentType = request.headers.get("content-type");

  // Allow requests with no body (e.g., POST with no content for check-in)
  if (!contentType) {
    return null;
  }

  // Content-Type must include application/json
  if (!contentType.includes("application/json")) {
    return createErrorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      "Content-Type must be application/json.",
      415
    );
  }

  return null;
}

/**
 * Validate request body size.
 * Returns an error response if the body exceeds the limit, or null if valid.
 */
export function validateBodySize(request: Request): Response | null {
  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > MAX_BODY_SIZE) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Request body too large. Maximum size is 1MB.",
        413
      );
    }
  }

  return null;
}

/**
 * Sanitize error for production responses.
 * Ensures no stack traces or internal details leak to clients.
 */
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    // In development, provide more context for debugging
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, always return a generic message
  return "An unexpected error occurred.";
}

/**
 * Log error safely without exposing sensitive data.
 * Strips potential sensitive fields before logging.
 */
export function safeLogError(context: string, error: unknown): void {
  if (error instanceof Error) {
    // Log error message and stack, but not any attached data
    console.error(`[${context}]`, error.message);
    if (process.env.NODE_ENV === "development") {
      console.error(error.stack);
    }
  } else {
    console.error(`[${context}]`, "Non-Error thrown");
  }
}
