// PMO System - CSP Violation Report Endpoint
// POST /api/v1/csp-report
// Receives Content Security Policy violation reports from browsers.
// No authentication required (called by the browser automatically).

import { NextRequest } from "next/server";

/**
 * POST /api/v1/csp-report
 * Accepts CSP violation reports sent by browsers when CSP rules are violated.
 * Logs violations for monitoring purposes.
 */
export async function POST(req: NextRequest) {
  try {
    // 브라우저는 CSP 리포트를 'application/csp-report' 또는 'application/json'으로 전송
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};

    // Log CSP violation for monitoring
    const report = body?.["csp-report"] ?? body;
    console.warn("[CSP Violation]", {
      blockedUri: report?.["blocked-uri"],
      violatedDirective: report?.["violated-directive"],
      documentUri: report?.["document-uri"],
      originalPolicy: report?.["original-policy"],
    });

    return new Response(null, { status: 204 });
  } catch {
    // Malformed report body — ignore silently
    return new Response(null, { status: 204 });
  }
}
