#!/usr/bin/env node
/**
 * Railway production startup script.
 *
 * 1. Directly fix any FAILED migration rows in _prisma_migrations via Prisma raw SQL.
 *    (More reliable than `prisma migrate resolve` CLI which may not output errors)
 * 2. Run `prisma migrate deploy`.
 * 3. Run `next start`.
 */

"use strict";

const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n>> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function fixFailedMigrations() {
  console.log("\n>> Checking for failed migrations in _prisma_migrations...");

  let prisma;
  try {
    // PrismaClient is generated during `prisma generate` (runs in build phase)
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();

    // Mark any FAILED (started but never finished or rolled-back) migration as rolled-back.
    // This unblocks Prisma's P3009 check so migrate deploy can re-apply them.
    const fixed = await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET "rolled_back_at" = NOW()
      WHERE "finished_at"    IS NULL
        AND "rolled_back_at" IS NULL
        AND "started_at"     IS NOT NULL
    `);

    if (fixed > 0) {
      console.log(`   Fixed ${fixed} failed migration(s) — will be re-applied now.`);
    } else {
      console.log("   No failed migrations found.");
    }
  } catch (err) {
    // Non-fatal: if we can't connect yet, migrate deploy will surface the real error.
    console.warn(`   Could not check migrations: ${err.message}`);
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => {});
    }
  }
}

async function main() {
  console.log("=== Railway Startup ===");

  await fixFailedMigrations();

  run("npx prisma migrate deploy");
  run("npx next start");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
