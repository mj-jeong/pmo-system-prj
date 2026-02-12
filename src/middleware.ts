// PMO System - Middleware
// Security-hardened middleware for the multi-tenant PMO system.
// Responsibilities:
// 1. Authentication enforcement on protected routes
// 2. Rate limiting on API endpoints
// 3. Security headers on all responses
// 4. Content-Type validation on state-changing API requests
// 5. Request size limits

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Route Classification
// ============================================================================

// Routes that do not require authentication
const PUBLIC_PATHS = ["/login", "/register"];

// Static/internal paths that bypass all middleware logic
function isStaticOrInternal(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes(".")
  );
}

// ============================================================================
// Rate Limiting (In-Middleware, Lightweight)
// ============================================================================

// In-memory sliding window rate limiter for Edge Runtime compatibility.
// This runs in the middleware (Edge Runtime) so we cannot import Node.js modules.
// For production multi-instance deployments, replace with Redis-backed solution.

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanupRateLimitStore(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  cleanupRateLimitStore(windowMs);

  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(identifier, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: maxRequests - entry.timestamps.length };
}

/**
 * Extract client IP from request headers.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  // Fallback for environments where ip is not available
  return "127.0.0.1";
}

// ============================================================================
// Rate Limit Configuration
// ============================================================================

// Auth login: 10 requests per 10 seconds per IP
const AUTH_LOGIN_WINDOW = 10_000;
const AUTH_LOGIN_MAX = 10;

// Auth register: 5 requests per 10 seconds per IP
const AUTH_REGISTER_WINDOW = 10_000;
const AUTH_REGISTER_MAX = 5;

// Global API: 100 requests per minute per IP
const GLOBAL_API_WINDOW = 60_000;
const GLOBAL_API_MAX = 100;

// Sensitive operations (DELETE, role changes): 20 requests per minute per IP
const SENSITIVE_WINDOW = 60_000;
const SENSITIVE_MAX = 20;

// ============================================================================
// Security Constants
// ============================================================================

// Maximum request body size: 1MB
const MAX_BODY_SIZE = 1_048_576;

// HTTP methods that should have application/json Content-Type
const BODY_METHODS = new Set(["POST", "PATCH", "PUT"]);

// ============================================================================
// Main Middleware
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // ------- Static/Internal: pass through -------
  if (isStaticOrInternal(pathname)) {
    return NextResponse.next();
  }

  // ------- API Routes: Rate Limiting + Security -------
  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);

    // 1. Specific rate limits for auth endpoints
    if (pathname.includes("/auth/register") && method === "POST") {
      const result = checkRateLimit(
        `register:${ip}`,
        AUTH_REGISTER_WINDOW,
        AUTH_REGISTER_MAX
      );
      if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many registration attempts. Please try again later.",
            },
          },
          { status: 429 }
        );
      }
    } else if (pathname.includes("/auth/") && method === "POST") {
      const result = checkRateLimit(
        `auth:${ip}`,
        AUTH_LOGIN_WINDOW,
        AUTH_LOGIN_MAX
      );
      if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message:
                "Too many authentication attempts. Please try again later.",
            },
          },
          { status: 429 }
        );
      }
    }

    // 2. Rate limit for sensitive operations (DELETE, role changes)
    if (method === "DELETE" || pathname.includes("/role")) {
      const result = checkRateLimit(
        `sensitive:${ip}`,
        SENSITIVE_WINDOW,
        SENSITIVE_MAX
      );
      if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
            },
          },
          { status: 429 }
        );
      }
    }

    // 3. Global API rate limit
    const globalResult = checkRateLimit(
      `global:${ip}`,
      GLOBAL_API_WINDOW,
      GLOBAL_API_MAX
    );
    if (!globalResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    }

    // 4. Content-Type validation for state-changing requests
    // EXCEPT for NextAuth routes (they use application/x-www-form-urlencoded)
    if (BODY_METHODS.has(method) && !pathname.startsWith("/api/auth")) {
      const contentType = request.headers.get("content-type");
      // Only enforce if content-type is present but not JSON
      // (some endpoints like check-in may have empty bodies)
      if (contentType && !contentType.includes("application/json")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Content-Type must be application/json.",
            },
          },
          { status: 415 }
        );
      }
    }

    // 5. Request body size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (!isNaN(size) && size > MAX_BODY_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Request body too large. Maximum size is 1MB.",
            },
          },
          { status: 413 }
        );
      }
    }

    // API routes pass through (auth handled by withOrgScope)
    const response = NextResponse.next();
    // Add rate limit headers to API responses
    response.headers.set(
      "X-RateLimit-Remaining",
      String(globalResult.remaining)
    );
    return response;
  }

  // ------- Public pages: allow without auth -------
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ------- Protected pages: require session -------
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ??
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
