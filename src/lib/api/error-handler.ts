// PMO System - Global Error Handler
// Maps API error codes to user-friendly toast messages.

import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "./client";

/** Human-readable messages for known error codes. */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INSUFFICIENT_ROLE: "Your role does not have sufficient permissions.",
  CROSS_ORG_ACCESS_DENIED: "Access denied: resource belongs to another organization.",
  NOT_FOUND: "The requested resource was not found.",
  PROJECT_NOT_FOUND: "Project not found.",
  USER_NOT_FOUND: "User not found.",
  ATTENDANCE_NOT_FOUND: "Attendance record not found.",
  TIME_OFF_NOT_FOUND: "Time-off request not found.",
  ORG_NOT_FOUND: "Organization not found.",
  CONFLICT: "A conflict occurred. Please try again.",
  EMAIL_ALREADY_EXISTS: "This email address is already registered.",
  ORG_SLUG_TAKEN: "This organization slug is already in use.",
  ATTENDANCE_ALREADY_LOGGED: "Attendance has already been recorded.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
  SERVICE_UNAVAILABLE: "Service is temporarily unavailable.",
};

/**
 * Show an error toast for an API error.
 * Returns the human-readable message for further use.
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    const message =
      ERROR_MESSAGES[error.code] ?? error.message ?? "An error occurred.";

    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });

    return message;
  }

  // Network or unknown errors
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  });

  return message;
}

/**
 * Show a success toast.
 */
export function showSuccessToast(message: string) {
  toast({
    title: "Success",
    description: message,
  });
}
