import type { NextConfig } from 'next';

const securityHeaders = [
  // Enforce HTTPS for 1 year, including subdomains
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Prevent clickjacking by only allowing same-origin framing
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control referrer information sent with requests
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  // Content Security Policy - restrict resource loading
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "report-uri /api/v1/csp-report",
    ].join('; '),
  },
  // Legacy XSS protection for older browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Restrict dangerous browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Disable X-Powered-By header to reduce fingerprinting
  poweredByHeader: false,
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
