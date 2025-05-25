#!/usr/bin/env node

/**
 * Staged Data Validation Script for Kenya Locations
 *
 * This script validates data integrity only when data files are staged for commit
 * Run with: node scripts/validate-staged.js
 */

import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    // If not in a git repo or no staged files, return empty array
    return [];
  }
}

function hasDataFiles(stagedFiles) {
  const dataFilePatterns = [
    "lib/data/counties.ts",
    "lib/data/sub-counties.ts",
    "lib/data/constituencies.ts",
    "lib/data/wards.ts",
    "lib/data/locality.ts",
    "lib/data/area.ts",
  ];

  return stagedFiles.some((file) =>
    dataFilePatterns.some((pattern) => file.includes(pattern))
  );
}

async function runFullValidation() {
  try {
    log("🔍 Running full data validation...", "blue");

    // Import and run the full validation
    const { default: validate } = await import("./validate-data.js");

    // The validate-data.js script will exit with code 1 if validation fails
    // and code 0 if it passes, so we don't need to handle the return value
  } catch (error) {
    log("❌ Validation failed!", "red");
    log(`Error: ${error.message}`, "red");
    process.exit(1);
  }
}

async function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    log("ℹ️  No staged files found. Skipping validation.", "yellow");
    return;
  }

  log("📋 Checking staged files...", "blue");
  log(`   Staged files: ${stagedFiles.join(", ")}`, "reset");

  if (hasDataFiles(stagedFiles)) {
    log("📊 Data files detected in staged changes.", "yellow");
    await runFullValidation();
  } else {
    log(
      "✅ No data files in staged changes. Skipping data validation.",
      "green"
    );
  }
}

// Run the validation
main().catch((error) => {
  log("❌ Unexpected error during validation:", "red");
  log(error.message, "red");
  process.exit(1);
});
