#!/usr/bin/env node
/**
 * Railway production startup script.
 *
 * 1. Run `prisma migrate deploy`.
 * 2. If Prisma P3009 error (failed migrations blocking deployment):
 *    - Resolve each failed migration with --rolled-back
 *    - Retry `prisma migrate deploy`
 * 3. Start `next start`.
 */

const { execSync, spawnSync } = require("child_process");

function run(cmd) {
  console.log(`\n>> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function tryMigrateDeploy() {
  const result = spawnSync(
    "npx",
    ["prisma", "migrate", "deploy"],
    { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" }
  );

  const output = (result.stdout || "") + (result.stderr || "");

  if (result.status === 0) {
    process.stdout.write(output);
    return true;
  }

  // P3009: failed migrations are blocking new ones
  if (output.includes("P3009")) {
    process.stdout.write(output);
    return false;
  }

  // Other error — fail hard
  process.stderr.write(output);
  process.exit(result.status || 1);
}

function resolveFailedMigrations(output) {
  // Extract migration names from the error message
  // Pattern: "The `20260223_phase1_core_enhancements` migration ... failed"
  const matches = output.match(/`(\d{14}_[a-z_]+)`/g) || [];
  const names = [...new Set(matches.map((m) => m.replace(/`/g, "")))];

  if (names.length === 0) {
    console.error("P3009 detected but could not extract migration names. Aborting.");
    process.exit(1);
  }

  for (const name of names) {
    console.log(`\n>> Resolving failed migration: ${name}`);
    const r = spawnSync(
      "npx",
      ["prisma", "migrate", "resolve", "--rolled-back", name],
      { stdio: "inherit", encoding: "utf8" }
    );
    if (r.status !== 0) {
      console.warn(`   Warning: Could not resolve ${name} (may already be resolved)`);
    }
  }
}

// --- Main ---

console.log("=== Railway Startup ===");

const firstTry = tryMigrateDeploy();

if (!firstTry) {
  // Re-capture output to extract names
  const result = spawnSync(
    "npx",
    ["prisma", "migrate", "deploy"],
    { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" }
  );
  const output = (result.stdout || "") + (result.stderr || "");

  console.log("\n>> P3009 detected — resolving failed migrations...");
  resolveFailedMigrations(output);

  console.log("\n>> Retrying migration deployment...");
  run("npx prisma migrate deploy");
}

console.log("\n>> Starting Next.js...");
run("npx next start");
