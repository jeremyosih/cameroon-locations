#!/usr/bin/env node

/**
 * Data Validation Script for Cameroon Locations
 *
 * This script validates the data integrity across all data files
 * Run with: node scripts/validate-data.js
 */

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

async function loadData() {
  try {
    // Import the built module
    const modulePath = join(__dirname, "../dist/index.js");
    const module = await import(modulePath);

    // Extract data using the exported functions
    const regions = module.getRegions();
    const divisions = module.getDivisions();
    const subdivisions = module.getSubdivisions();
    const districts = module.getDistricts();

    return { regions, divisions, subdivisions, districts };
  } catch (error) {
    log(
      '❌ Error loading data. Make sure to run "npm run build" first.',
      "red"
    );
    log(`Error: ${error.message}`, "red");
    process.exit(1);
  }
}

function validateUniqueIds(data, type, idField = "code") {
  const ids = new Set();
  const duplicates = [];

  data.forEach((item, index) => {
    const id = item[idField];
    if (ids.has(id)) {
      duplicates.push({ id, index });
    } else {
      ids.add(id);
    }
  });

  if (duplicates.length > 0) {
    log(`❌ Duplicate ${idField}s found in ${type}:`, "red");
    duplicates.forEach(({ id, index }) => {
      log(`   - ${id} (at index ${index})`, "red");
    });
    return false;
  } else {
    log(`✅ All ${type} ${idField}s are unique`, "green");
    return true;
  }
}

function validateReferences(data, type, refField, refData, refType) {
  const refNames = new Set(refData.map((item) => item.name));
  const invalidRefs = [];

  data.forEach((item, index) => {
    const refValue = item[refField];
    if (!refNames.has(refValue)) {
      invalidRefs.push({ item: item.name, refValue, index });
    }
  });

  if (invalidRefs.length > 0) {
    log(`❌ Invalid ${refField} references found in ${type}:`, "red");
    invalidRefs.forEach(({ item, refValue, index }) => {
      log(
        `   - ${item} references "${refValue}" (${refType} not found)`,
        "red"
      );
    });
    return false;
  } else {
    log(`✅ All ${type} ${refField} references are valid`, "green");
    return true;
  }
}

function validateRequiredFields(data, type, requiredFields) {
  const missingFields = [];

  data.forEach((item, index) => {
    requiredFields.forEach((field) => {
      if (
        !item[field] ||
        (typeof item[field] === "string" && item[field].trim() === "")
      ) {
        missingFields.push({
          item: item.name || `item at index ${index}`,
          field,
        });
      }
    });
  });

  if (missingFields.length > 0) {
    log(`❌ Missing required fields in ${type}:`, "red");
    missingFields.forEach(({ item, field }) => {
      log(`   - ${item} missing ${field}`, "red");
    });
    return false;
  } else {
    log(`✅ All ${type} have required fields`, "green");
    return true;
  }
}

async function main() {
  log("🔍 Starting Cameroon Locations Data Validation...", "blue");
  log("", "reset");

  const data = await loadData();
  const { regions, divisions, subdivisions, districts } = data;

  let allValid = true;

  // Validate data counts
  log("📊 Data Summary:", "blue");
  log(`   - Regions: ${regions.length}`, "reset");
  log(`   - Divisions: ${divisions.length}`, "reset");
  log(`   - Subdivisions: ${subdivisions.length}`, "reset");
  log(`   - Districts: ${districts.length}`, "reset");
  log("", "reset");

  // Validate unique IDs
  log("🔑 Validating Unique IDs...", "blue");
  allValid &= validateUniqueIds(regions, "regions", "code");
  allValid &= validateUniqueIds(regions, "regions", "nameFr");
  allValid &= validateUniqueIds(regions, "regions", "nameEn");
  allValid &= validateUniqueIds(divisions, "divisions", "code");
  allValid &= validateUniqueIds(divisions, "divisions", "nameFr");
  allValid &= validateUniqueIds(subdivisions, "subdivisions", "code");
  allValid &= validateUniqueIds(subdivisions, "subdivisions", "nameFr");
  allValid &= validateUniqueIds(districts, "districts", "code");
  allValid &= validateUniqueIds(districts, "districts", "nameFr");
  log("", "reset");

  // Validate required fields
  log("📝 Validating Required Fields...", "blue");
  allValid &= validateRequiredFields(regions, "regions", [
    "code",
    "nameFr",
    "nameEn",
  ]);
  allValid &= validateRequiredFields(divisions, "divisions", [
    "code",
    "nameFr",
    "nameEn",
    "region",
  ]);
  allValid &= validateRequiredFields(subdivisions, "subdivisions", [
    "code",
    "nameFr",
    "nameEn",
    "division",
  ]);
  allValid &= validateRequiredFields(districts, "districts", [
    "code",
    "nameFr",
    "nameEn",
    "subdivision",
  ]);
  log("", "reset");

  // Validate references
  log("🔗 Validating References...", "blue");
  allValid &= validateReferences(
    divisions,
    "divisions",
    "region",
    regions,
    "region"
  );
  allValid &= validateReferences(
    subdivisions,
    "subdivisions",
    "division",
    divisions,
    "division"
  );
  allValid &= validateReferences(
    districts,
    "districts",
    "subdivision",
    subdivisions,
    "subdivision"
  );
  log("", "reset");

  // Final result
  if (allValid) {
    log("🎉 All validations passed! Data integrity is maintained.", "green");
    process.exit(0);
  } else {
    log("❌ Some validations failed. Please fix the issues above.", "red");
    process.exit(1);
  }
}

main().catch((error) => {
  log(`❌ Validation script failed: ${error.message}`, "red");
  process.exit(1);
});
