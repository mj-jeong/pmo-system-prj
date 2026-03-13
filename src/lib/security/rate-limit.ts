// PMO System - Rate Limiting
// In-memory sliding window rate limiter for API protection.
// Supports per-IP rate limiting with configurable windows and limits.
//
// Usage:
//   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 100 });
//   const result = limiter.check(ip);
//   if (!result.allowed) return createErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, ...);

import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

/**
 * Rate limiter configuration.
 */
interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  maxRequests: number;
}

/**
 * Result of a rate limit check.
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Tracks request timestamps per identifier (IP address).
 */
interface RateLimitStore {
  timestamps: number[];
  resetAt: number;
}

/**
 * In-memory rate limiter using sliding window algorithm.
 * Suitable for single-instance deployments.
 * For multi-instance, replace with Redis-backed implementation.
 */
class RateLimiter {
  private store = new Map<string, RateLimitStore>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;

    // Periodic cleanup to prevent memory leaks from stale entries
    // Runs every 60 seconds
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
      // Prevent the interval from keeping the process alive
      if (this.cleanupInterval && "unref" in this.cleanupInterval) {
        (this.cleanupInterval as any).unref();
      }
    }
  }

  /**
   * Check if a request from the given identifier is allowed.
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(identifier);

    if (!entry) {
      entry = { timestamps: [], resetAt: now + this.windowMs };
      this.store.set(identifier, entry);
    }

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      // Rate limit exceeded
      const oldestInWindow = entry.timestamps[0] || now;
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestInWindow + this.windowMs,
      };
    }

    // Record this request
    entry.timestamps.push(now);
    entry.resetAt = now + this.windowMs;

    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Remove stale entries from the store.
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, entry] of this.store.entries()) {
      // Remove entries with no recent timestamps
      const recentTimestamps = entry.timestamps.filter((t) => t > windowStart);
      if (recentTimestamps.length === 0) {
        this.store.delete(key);
      } else {
        entry.timestamps = recentTimestamps;
      }
    }
  }
}

/**
 * Pre-configured rate limiters for different endpoint categories.
 */

// Global API: 100 requests per minute per IP
export const globalApiLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
});

// Auth endpoints: 10 requests per 10 seconds per IP
export const authLimiter = new RateLimiter({
  windowMs: 10_000,
  maxRequests: 10,
});

// Registration: 5 requests per 10 seconds per IP
export const registerLimiter = new RateLimiter({
  windowMs: 10_000,
  maxRequests: 5,
});

// Sensitive operations: 20 requests per minute per IP
export const sensitiveLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});

/**
 * Extract client IP address from a request.
 * Checks X-Forwarded-For header first (for reverse proxy setups),
 * then falls back to the connection address.
 */
export function getClientIp(request: Request): string {
  // Railway 배포 환경: 로드 밸런서가 클라이언트 IP를 X-Forwarded-For의 마지막에 추가.
  // 첫 번째 IP는 클라이언트가 스푸핑 가능하므로 마지막 값을 신뢰함.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim()).filter(Boolean);
    const lastIp = ips[ips.length - 1];
    if (lastIp) return lastIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback for local development
  return "127.0.0.1";
}

/**
 * Create a rate limit exceeded response with standard headers.
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);

  return createErrorResponse(
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    "Too many requests. Please try again later.",
    429
  );
}

/**
 * Factory function for creating custom rate limiters.
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}
