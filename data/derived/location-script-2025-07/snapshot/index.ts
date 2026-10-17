#!/usr/bin/env bun

/**
 * Master script to process Cameroon location data in 8 steps:
 * 1. Parse PDF data and generate base JSON (clean-index.ts)
 * 2. Add population data from extracted text (add-population.ts)
 * 3. Add HASC codes to regions and divisions (add-hasc-codes.ts)
 * 4. Add P-codes and English names to regions (add-pcode-english.ts)
 * 5. Add English translations to all entities (add-translation.ts)
 * 6. Add council names to subdivisions (apply-council-names.ts)
 * 7. Enhance GeoJSON with location properties (add-geojson-properties.ts)
 * 8. Process ELECAM polling station data (add-elecam-data.ts)
 */

import { spawn } from 'bun';

// Helper function to run a script and wait for completion
async function runScript(scriptName: string, args: string[] = []): Promise<void> {
  console.log(`\n🚀 Running ${scriptName}...`);
  console.log('=' .repeat(50));
  
  const proc = spawn(['bun', 'run', scriptName, ...args], {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: process.cwd()
  });
  
  const exitCode = await proc.exited;
  
  if (exitCode !== 0) {
    throw new Error(`❌ ${scriptName} failed with exit code ${exitCode}`);
  }
  
  console.log(`✅ ${scriptName} completed successfully`);
}

// Main pipeline execution
async function main() {
  const startTime = Date.now();
  
  console.log('🇨🇲 CAMEROON LOCATION DATA PROCESSING PIPELINE');
  console.log('=' .repeat(60));
  console.log('This script will run 9 steps to process location data:');
  console.log('1. Parse PDF data → cameroon_locations.json');
  console.log('2. Add population data → cameroon_locations_with_population.json');
  console.log('3. Add HASC codes → cameroon_locations_with_hasc.json');
  console.log('4. Add P-codes & English → cameroon_locations_complete.json');
  console.log('5. Add translations → cameroon_locations_with_translations.json');
  console.log('6. Add council names → cameroon_locations_complete.json (updated)');
  console.log('7. Enhance GeoJSON → geoBoundaries-CMR-ADM3-enhanced.geojson');
  console.log('8. Process ELECAM data → elecam_polling_stations.json');
  console.log('9. Export to library → cameroon-locations TypeScript files');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Parse PDF data and generate base JSON
    console.log('\n📋 STEP 1: Parsing location data from PDF');
    await runScript('clean-index.ts', ['./locv2_cleaned.txt']);
    
    // Step 2: Add population data
    console.log('\n👥 STEP 2: Adding population data');
    await runScript('add-population.ts');
    
    // Step 3: Add HASC codes
    console.log('\n🏷️  STEP 3: Adding HASC codes');
    await runScript('add-hasc-codes.ts');
    
    // Step 4: Add P-codes and English names
    console.log('\n🌍 STEP 4: Adding P-codes and English translations');
    await runScript('add-pcode-english.ts');
    
    // Step 5: Add English translations
    console.log('\n🔤 STEP 5: Adding comprehensive English translations');
    await runScript('add-translation.ts');
    
    // Step 6: Add council names
    console.log('\n🏛️  STEP 6: Adding council names to subdivisions');
    await runScript('apply-council-names.ts');
    
    // Step 7: Enhance GeoJSON with properties
    console.log('\n🗺️  STEP 7: Enhancing GeoJSON with location properties');
    await runScript('add-geojson-properties.ts');
    
    // Step 8: Process ELECAM polling station data
    console.log('\n🗳️  STEP 8: Processing ELECAM polling station data');
    await runScript('add-elecam-data.ts');
    
    // Step 9: Export data to cameroon-locations library format
    console.log('\n📦 STEP 9: Exporting to cameroon-locations library format');
    await runScript('export-to-library.ts');
    
    // Success summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total processing time: ${duration} seconds`);
    console.log('📁 Output files created:');
    console.log('   • cameroon_locations.json (base data)');
    console.log('   • cameroon_locations_with_population.json (+ population data)');
    console.log('   • cameroon_locations_with_hasc.json (+ HASC codes)');
    console.log('   • cameroon_locations_complete.json (+ P-codes, English & council names)');
    console.log('   • cameroon_locations_with_translations.json (+ complete translations)');
    console.log('   • geoBoundaries-CMR-ADM3-enhanced.geojson (+ enhanced GeoJSON)');
    console.log('   • elecam_polling_stations.json (+ ELECAM polling station data)');
    console.log('   • elecam_unmatched_councils.json (+ unmatched councils report)');
    console.log('   • cameroon-locations/lib/data/*.ts (+ TypeScript data files)');
    console.log('   • cameroon-locations/lib/extensions/*/data.ts (+ Extension data)');
    console.log('\n✨ Your complete Cameroon location data is ready in both JSON and TypeScript formats!');
    
  } catch (error) {
    console.error('\n' + '=' .repeat(60));
    console.error('💥 PIPELINE FAILED');
    console.error('=' .repeat(60));
    console.error(`Error: ${error}`);
    console.error('\nPlease check the error above and fix any issues before retrying.');
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Pipeline interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Pipeline terminated');
  process.exit(1);
});

// Run the pipeline
main();