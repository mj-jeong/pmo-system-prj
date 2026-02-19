#!/bin/bash
# =============================================================================
# PMO System - Production Database Migration Script
# =============================================================================
# Usage: bash prisma/migrate-deploy.sh
#
# Applies all pending Prisma migrations to the target database using
# `prisma migrate deploy`. This command is safe for production:
#   - Does NOT create new migrations
#   - Does NOT reset the database
#   - Applies only committed, version-controlled migration files
#
# Prerequisites:
#   - DATABASE_URL environment variable must be set
#   - Run from the project root directory
# =============================================================================

set -e  # Exit immediately on any error

echo "=================================================="
echo "PMO System - Database Migration"
echo "=================================================="
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo "Set it before running this script."
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "Migration complete. Current database status:"
npx prisma migrate status

echo ""
echo "=================================================="
echo "Migration finished successfully."
echo "=================================================="
