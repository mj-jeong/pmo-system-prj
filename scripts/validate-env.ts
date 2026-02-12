#!/usr/bin/env ts-node

/**
 * Environment Variable Validation Script
 *
 * Validates all required environment variables before deployment.
 * Run with: ts-node scripts/validate-env.ts
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters for security')
    .regex(/^[A-Za-z0-9+/=]+$/, 'AUTH_SECRET must be a valid base64 string'),

  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  console.log('🔍 Validating environment variables...\n');

  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const validated = envSchema.parse(env);

    console.log('✅ All environment variables are valid!\n');
    console.log('Environment Configuration:');
    console.log('─'.repeat(50));
    console.log(`DATABASE_URL: ${maskConnectionString(validated.DATABASE_URL)}`);
    console.log(`AUTH_SECRET: ${'*'.repeat(validated.AUTH_SECRET.length)} (${validated.AUTH_SECRET.length} chars)`);
    console.log(`NEXTAUTH_URL: ${validated.NEXTAUTH_URL}`);
    console.log(`NEXT_PUBLIC_APP_URL: ${validated.NEXT_PUBLIC_APP_URL}`);
    console.log(`NODE_ENV: ${validated.NODE_ENV}`);
    console.log('─'.repeat(50));
    console.log();

    // Security checks
    performSecurityChecks(validated);

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
      console.error();
      console.error('📋 Required environment variables:');
      console.error('  - DATABASE_URL: PostgreSQL connection string');
      console.error('  - AUTH_SECRET: Minimum 32 characters (generate with: openssl rand -base64 32)');
      console.error('  - NEXTAUTH_URL: Application URL for NextAuth');
      console.error('  - NEXT_PUBLIC_APP_URL: Public-facing application URL');
      console.error();
      console.error('💡 Copy .env.example to .env.local and fill in the values.');
      process.exit(1);
    }
    throw error;
  }
}

function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return url.replace(/:[^:@]+@/, ':***@');
  }
}

function performSecurityChecks(env: Env): void {
  console.log('🛡️ Security Checks:');
  console.log('─'.repeat(50));

  const warnings: string[] = [];

  // Check AUTH_SECRET strength
  if (env.AUTH_SECRET.length < 64) {
    warnings.push(`AUTH_SECRET is only ${env.AUTH_SECRET.length} chars (recommended: 64+)`);
  }

  // Check for localhost in production
  if (env.NODE_ENV === 'production') {
    if (env.NEXTAUTH_URL.includes('localhost') || env.NEXTAUTH_URL.includes('127.0.0.1')) {
      warnings.push('NEXTAUTH_URL contains localhost in production environment');
    }
    if (env.NEXT_PUBLIC_APP_URL.includes('localhost') || env.NEXT_PUBLIC_APP_URL.includes('127.0.0.1')) {
      warnings.push('NEXT_PUBLIC_APP_URL contains localhost in production environment');
    }
    if (!env.DATABASE_URL.includes('sslmode=require') && !env.DATABASE_URL.includes('ssl=true')) {
      warnings.push('DATABASE_URL should use SSL in production (add ?sslmode=require)');
    }
  }

  // Check for HTTP in production
  if (env.NODE_ENV === 'production') {
    if (env.NEXTAUTH_URL.startsWith('http:')) {
      warnings.push('NEXTAUTH_URL should use HTTPS in production');
    }
    if (env.NEXT_PUBLIC_APP_URL.startsWith('http:')) {
      warnings.push('NEXT_PUBLIC_APP_URL should use HTTPS in production');
    }
  }

  if (warnings.length === 0) {
    console.log('✅ No security warnings');
  } else {
    console.log('⚠️  Security Warnings:');
    warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
  }

  console.log('─'.repeat(50));
  console.log();
}

// Run validation
if (require.main === module) {
  validateEnv();
}

export { validateEnv };
