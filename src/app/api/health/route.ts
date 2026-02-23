import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns application health status including:
 * - API availability
 * - Database connectivity
 * - System timestamp
 *
 * Used by:
 * - Monitoring systems (Vercel, uptime monitors)
 * - Load balancers
 * - Deployment validation
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          api: 'operational',
          database: 'operational',
        },
        performance: {
          responseTimeMs: responseTime,
        },
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 200 }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Return 200 so Railway healthcheck passes even if DB is temporarily unavailable.
    // The degraded status in the body can be monitored separately.
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          api: 'operational',
          database: 'unavailable',
        },
        performance: {
          responseTimeMs: responseTime,
        },
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 200 }
    );
  }
}
