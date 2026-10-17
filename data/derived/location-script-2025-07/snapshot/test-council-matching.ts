#!/usr/bin/env bun

/**
 * Script to test subdivision-council matching
 * Uses existing fuzzy matching logic from add-geojson-properties.ts
 * Reports successful matches and failures for manual correction
 */

interface CouncilMapping {
  [subdivisionName: string]: {
    councilNameFr: string;
    councilNameEn: string;
  };
}

interface GeoJSONFeature {
  type: string;
  properties: {
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: string;
  };
  geometry: any;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

// Copy the existing matching functions from add-geojson-properties.ts
function decodeGeoJSONName(name: string): string {
  const result = name
    // Handle specific problematic encodings FIRST (before general character replacements)
    .replace(/Ã\u0089sÃ©ka/g, 'Eséka')  // ÃsÃ©ka -> Eséka (with correct Unicode chars)
    .replace(/Ã\u0089dÃ©a/g, 'Edéa')    // ÃdÃ©a -> Edéa (with correct Unicode chars)
    // Handle individual character replacements
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¬/g, 'ì')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã¢/g, 'â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã®/g, 'î')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã»/g, 'û')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã±/g, 'ñ')
    // Handle the remaining Ã characters (these represent capital letters)
    .replace(/^Ãs/g, 'Es')  // Ãséka -> Eséka
    .replace(/^Ãd/g, 'Ed')  // Ãdéa -> Edéa
  
  // Debug output removed
  
  return result;
}

function normalizeNameForMatching(name: string): string {
  const normalized = name
    .toUpperCase()
    .trim()
    // Remove accents and special characters
    .replace(/[àáâãäåÀÁÂÃÄÅ]/g, 'A')
    .replace(/[èéêëÈÉÊË]/g, 'E')
    .replace(/[ìíîïÌÍÎÏ]/g, 'I')
    .replace(/[òóôõöÒÓÔÕÖ]/g, 'O')
    .replace(/[ùúûüÙÚÛÜ]/g, 'U')
    .replace(/[çÇ]/g, 'C')
    .replace(/[ñÑ]/g, 'N')
    // Handle apostrophes and quotes
    .replace(/[\u2019''`′]/g, '') // Remove apostrophes
    .replace(/[""]/g, '') // Remove quotes
    // Convert ordinal numbers to Roman numerals
    .replace(/\b1ER\b/g, 'I')
    .replace(/\b1ST\b/g, 'I')
    .replace(/\b2E\b/g, 'II')
    .replace(/\b2ND\b/g, 'II')
    .replace(/\b3E\b/g, 'III')
    .replace(/\b3RD\b/g, 'III')
    .replace(/\b4E\b/g, 'IV')
    .replace(/\b4TH\b/g, 'IV')
    .replace(/\b5E\b/g, 'V')
    .replace(/\b5TH\b/g, 'V')
    .replace(/\b6E\b/g, 'VI')
    .replace(/\b6TH\b/g, 'VI')
    .replace(/\b7E\b/g, 'VII')
    .replace(/\b7TH\b/g, 'VII')
    // Convert individual numbers to Roman numerals
    .replace(/\b1\b/g, 'I')
    .replace(/\b2\b/g, 'II')
    .replace(/\b3\b/g, 'III')
    .replace(/\b4\b/g, 'IV')
    .replace(/\b5\b/g, 'V')
    .replace(/\b6\b/g, 'VI')
    .replace(/\b7\b/g, 'VII')
    // Also handle Roman numerals in subdivision names
    .replace(/\sI\b/g, '-I')
    .replace(/\sII\b/g, '-II')
    .replace(/\sIII\b/g, '-III')
    .replace(/\sIV\b/g, '-IV')
    .replace(/\sV\b/g, '-V')
    .replace(/\sVI\b/g, '-VI')
    .replace(/\sVII\b/g, '-VII')
    // Handle common spelling variations
    .replace(/BATSCHENGA/g, 'BATCHENGA')
    .replace(/EZENDOUAN/g, 'EDZENDOUAN')
    .replace(/MAKARI/g, 'MAKARY')
    .replace(/KARHAY/g, 'KAR-HAY')
    .replace(/SANCHOU/g, 'SANTCHOU')
    .replace(/MALENTOUEN/g, 'MALANTOUEN')
    .replace(/MASSANGAN/g, 'MASSANGAM')
    .replace(/MUYAKA/g, 'MUYUKA')
    .replace(/NGAMBE/g, 'NGAMBE-TIKAR')
    .replace(/NGAMBE-TIKAR/g, 'NGAMBE')
    .replace(/NKAMBE/g, 'NKAMBE')
    .replace(/NKAMBÉ/g, 'NKAMBE')
    .replace(/NKAMBE/g, 'NKAMBÉ')
    .replace(/NGAOUNDERE/g, 'NGAOUNDERE')
    .replace(/NGAOUNDÉRÉ/g, 'NGAOUNDERE')
    .replace(/NGAOUNDERE/g, 'NGAOUNDÉRÉ')
    .replace(/BAFOUSSAM/g, 'BAFOUSSAM')
    .replace(/BAFANG/g, 'BAFANG')
    .replace(/BANDJOUN/g, 'BANDJOUN')
    .replace(/DSCHANG/g, 'DSCHANG')
    .replace(/FOUMBAN/g, 'FOUMBAN')
    .replace(/FOUMBOT/g, 'FOUMBOT')
    .replace(/MBOUDA/g, 'MBOUDA')
    .replace(/PENKA-MICHEL/g, 'PENKA-MICHEL')
    .replace(/SANTCHOU/g, 'SANTCHOU')
    .replace(/BANGANGTE/g, 'BANGANGTE')
    .replace(/BANGANGTÉ/g, 'BANGANGTE')
    .replace(/BANGANGTE/g, 'BANGANGTÉ')
    // Handle specific problematic names
    .replace(/^EBONE$/g, 'EBONE')
    .replace(/^DEMDING$/g, 'DEMDING')
    .replace(/^BOURHA$/g, 'BOURRHA')
    // Normalize spaces and dashes
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  return normalized;
}

function findMatchingCouncil(subdivisionName: string, councilNames: string[]): string | null {
  const normalizedSubdivisionName = normalizeNameForMatching(subdivisionName);
  
  // Try exact match first
  for (const councilName of councilNames) {
    const decodedCouncilName = decodeGeoJSONName(councilName);
    const normalizedCouncilName = normalizeNameForMatching(decodedCouncilName);
    
    if (normalizedCouncilName === normalizedSubdivisionName) {
      return councilName;
    }
  }
  
  // Try partial matches for common variations
  for (const councilName of councilNames) {
    const decodedCouncilName = decodeGeoJSONName(councilName);
    const normalizedCouncilName = normalizeNameForMatching(decodedCouncilName);
    
    // Handle common variations
    const subdivisionWithVariations = normalizedSubdivisionName
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/NORD/g, 'NORTH')
      .replace(/NORTH/g, 'NORD')
      .replace(/OUEST/g, 'WEST')
      .replace(/WEST/g, 'OUEST')
      .replace(/SUD/g, 'SOUTH')
      .replace(/SOUTH/g, 'SUD')
      .replace(/EST/g, 'EAST')
      .replace(/EAST/g, 'EST');
    
    const councilWithVariations = normalizedCouncilName
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/NORD/g, 'NORTH')
      .replace(/NORTH/g, 'NORD')
      .replace(/OUEST/g, 'WEST')
      .replace(/WEST/g, 'OUEST')
      .replace(/SUD/g, 'SOUTH')
      .replace(/SOUTH/g, 'SUD')
      .replace(/EST/g, 'EAST')
      .replace(/EAST/g, 'EST');
    
    if (subdivisionWithVariations === councilWithVariations) {
      return councilName;
    }
  }
  
  return null;
}

async function main(): Promise<void> {
  try {
    console.log('🧪 Testing subdivision-council matching...\n');

    // 1. Read the mapping file
    console.log('📖 Reading subdivision-council-mapping.json...');
    const mappingFile = await Bun.file('./subdivision-council-mapping.json').text();
    const mapping: CouncilMapping = JSON.parse(mappingFile);
    
    const subdivisionNames = Object.keys(mapping);
    console.log(`✅ Found ${subdivisionNames.length} subdivisions to match\n`);

    // 2. Read council names
    console.log('📖 Reading council names from geoBoundaries-CMR-ADM3.geojson...');
    const geoJsonFile = await Bun.file('./geoBoundaries-CMR-ADM3.geojson').text();
    const geoJsonData: GeoJSONData = JSON.parse(geoJsonFile);
    
    const councilNames = geoJsonData.features
      .filter(f => f.properties.shapeType === 'ADM3')
      .map(f => f.properties.shapeName)
      .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
    
    console.log(`✅ Found ${councilNames.length} council names\n`);

    // 3. Test matching
    console.log('🔍 Testing matches...\n');
    
    const matches: Array<{subdivision: string, council: string, decoded: string}> = [];
    const failures: Array<{subdivision: string, normalized: string}> = [];
    const manualEntries: Array<{subdivision: string, councilFr: string, councilEn: string}> = [];
    const usedCouncils = new Set<string>();
    
    for (const subdivisionName of subdivisionNames) {
      const currentEntry = mapping[subdivisionName];
      
      // Check if this subdivision already has manual entries
      if (currentEntry.councilNameFr && currentEntry.councilNameEn) {
        manualEntries.push({
          subdivision: subdivisionName,
          councilFr: currentEntry.councilNameFr,
          councilEn: currentEntry.councilNameEn
        });
        
        // Find the original council name that matches this manual entry
        const originalCouncilName = councilNames.find(council => {
          const decoded = decodeGeoJSONName(council);
          return decoded === currentEntry.councilNameFr || decoded === currentEntry.councilNameEn;
        });
        
        if (originalCouncilName) {
          usedCouncils.add(originalCouncilName);
        }
        
        continue; // Skip automatic matching for manual entries
      }
      
      const matchedCouncil = findMatchingCouncil(subdivisionName, councilNames);
      
      if (matchedCouncil) {
        const decodedCouncil = decodeGeoJSONName(matchedCouncil);
        matches.push({
          subdivision: subdivisionName,
          council: matchedCouncil,
          decoded: decodedCouncil
        });
        
        // Track which councils were used
        usedCouncils.add(matchedCouncil);
        
        // Update the mapping with successful matches
        mapping[subdivisionName] = {
          councilNameFr: decodedCouncil,
          councilNameEn: decodedCouncil // For now, use same name for both languages
        };
      } else {
        const normalizedName = normalizeNameForMatching(subdivisionName);
        failures.push({
          subdivision: subdivisionName,
          normalized: normalizedName
        });
      }
    }
    
    // Find unused councils
    const unusedCouncils = councilNames.filter(council => !usedCouncils.has(council));

    // 4. Report results
    console.log('✅ AUTOMATIC MATCHES:');
    matches.forEach((match, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. "${match.subdivision}" → "${match.council}" (decoded: "${match.decoded}")`);
    });
    
    console.log(`\n🔧 MANUAL ENTRIES (preserved):`);
    manualEntries.forEach((entry, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. "${entry.subdivision}" → "${entry.councilFr}"`);
    });
    
    console.log(`\n❌ FAILED SUBDIVISION MATCHES (${failures.length}):`);
    failures.forEach((failure, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. "${failure.subdivision}" (normalized: "${failure.normalized}")`);
    });

    console.log(`\n🔍 UNUSED COUNCIL NAMES (${unusedCouncils.length}):`);
    unusedCouncils.forEach((council, index) => {
      const decoded = decodeGeoJSONName(council);
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. "${council}" (decoded: "${decoded}")`);
    });

    // 5. Save updated mapping
    const updatedMappingJson = JSON.stringify(mapping, null, 2);
    await Bun.write('./subdivision-council-mapping.json', updatedMappingJson);
    
    console.log(`\n💾 Updated subdivision-council-mapping.json with ${matches.length} successful matches`);

    // 6. Summary
    console.log('\n📊 MATCHING SUMMARY:');
    console.log(`   • Total subdivisions: ${subdivisionNames.length}`);
    console.log(`   • Total councils: ${councilNames.length}`);
    console.log(`   • Automatic matches: ${matches.length} (${((matches.length / subdivisionNames.length) * 100).toFixed(1)}%)`);
    console.log(`   • Manual entries: ${manualEntries.length} (${((manualEntries.length / subdivisionNames.length) * 100).toFixed(1)}%)`);
    console.log(`   • Total completed: ${matches.length + manualEntries.length} (${(((matches.length + manualEntries.length) / subdivisionNames.length) * 100).toFixed(1)}%)`);
    console.log(`   • Failed subdivision matches: ${failures.length} (${((failures.length / subdivisionNames.length) * 100).toFixed(1)}%)`);
    console.log(`   • Unused councils: ${unusedCouncils.length}`);
    
    if (failures.length === 0) {
      console.log('\n🎉 Perfect! All subdivisions have been matched!');
      console.log('🎯 Next step: Run apply-council-names.ts to update the main data file');
    } else {
      console.log('\n🔧 Manual correction needed for failed matches.');
      console.log('📝 Edit subdivision-council-mapping.json to match failed subdivisions with unused councils.');
      console.log('💡 Compare the failed subdivisions with unused councils above to find matches.');
      console.log('🔄 Re-run this script after making corrections.');
      console.log(`\n✅ Progress: ${matches.length + manualEntries.length}/${subdivisionNames.length} subdivisions completed`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}