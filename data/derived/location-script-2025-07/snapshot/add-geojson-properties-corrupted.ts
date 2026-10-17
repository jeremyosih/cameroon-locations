import assert from 'assert';

// Interfaces matching the JSON structure
interface PopulationData {
  total: number;
  male: number;
  female: number;
}
}

// Find matching division
function findMatchingDivision(shapeName: string, divisions: Division[]): Division | null {
  const decodedShapeName = decodeGeoJSONName(shapeName);
  const normalizedShapeName = normalizeNameForMatching(decodedShapeName);
  
  // Try exact match first
  for (const division of divisions) {
    const normalizedDivisionName = normalizeNameForMatching(division.nameFr);
    if (normalizedDivisionName === normalizedShapeName) {
      return division;
    }
  }
  
  // Try partial matches for common variations
  for (const division of divisions) {
    const normalizedDivisionName = normalizeNameForMatching(division.nameFr);
    
    // Handle common variations
    const shapeWithVariations = normalizedShapeName
      .replace(/NYONG-ET-SOO/g, 'NYONG-ET-SO')
      .replace(/KUPE-ET-MANENGUBA/g, 'KUPE-MANENGUBA')
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/-?ET-?/g, '-') // Handle ET variations
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    const divisionWithVariations = normalizedDivisionName
      .replace(/NYONG-ET-SO/g, 'NYONG-ET-SOO')
      .replace(/KUPE-MANENGUBA/g, 'KUPE-ET-MANENGUBA')
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/-?ET-?/g, '-') // Handle ET variations
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    if (shapeWithVariations === divisionWithVariations || 
        normalizedShapeName === divisionWithVariations ||
        shapeWithVariations === normalizedDivisionName) {
      return division;
    }
  }
  
  return null;
}

// Find matching subdivision using council names
function findMatchingSubdivision(shapeName: string, subdivisions: Subdivision[]): Subdivision | null {
  // Decode the shape name first
  const decodedShapeName = decodeGeoJSONName(shapeName);
  const normalizedShapeName = normalizeNameForMatching(decodedShapeName);
  
  // Try exact match with council names first
  for (const subdivision of subdivisions) {
    if (subdivision.councilNameFr) {
      const normalizedCouncilName = normalizeNameForMatching(subdivision.councilNameFr);
      if (normalizedCouncilName === normalizedShapeName) {
        return subdivision;
      }
    }
  }
  
  // Try partial matches for common variations with council names
  for (const subdivision of subdivisions) {
    if (subdivision.councilNameFr) {
      const normalizedCouncilName = normalizeNameForMatching(subdivision.councilNameFr);
      
      // Handle common variations
      const shapeWithVariations = normalizedShapeName
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
      
      if (shapeWithVariations === councilWithVariations ||
          normalizedShapeName.replace(/[-\s]/g, '') === normalizedCouncilName.replace(/[-\s]/g, '')) {
        return subdivision;
      }
    }
  }
  
  return null;
}
  
  const normalizedShapeName = normalizeNameForMatching(processedName);
  
  // Try exact match first
  for (const subdivision of subdivisions) {
    const normalizedSubdivisionName = normalizeNameForMatching(subdivision.nameFr);
    if (normalizedSubdivisionName === normalizedShapeName) {
      return subdivision;
    }
  }
  
  // Try partial matches for common variations
  for (const subdivision of subdivisions) {
    const normalizedSubdivisionName = normalizeNameForMatching(subdivision.nameFr);
    
    // Handle common variations
    const shapeWithVariations = normalizedShapeName
      .replace(/BAMENDA-([IVX]+)/g, 'BAMENDA-$1')
      .replace(/BAMENDA-(\d+)/g, 'BAMENDA-$1')
      .replace(/NGAN-HA/g, 'NGANHA')
      .replace(/MVANGAN/g, 'MVENGUE') // Common variation
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      // Handle dash/space variations
      .replace(/-/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    const subdivisionWithVariations = normalizedSubdivisionName
      .replace(/BAMENDA-([IVX]+)/g, 'BAMENDA-$1')
      .replace(/BAMENDA-(\d+)/g, 'BAMENDA-$1')
      .replace(/NGANHA/g, 'NGAN-HA')
      .replace(/MVENGUE/g, 'MVANGAN') // Common variation
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      // Handle dash/space variations
      .replace(/-/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    if (shapeWithVariations === subdivisionWithVariations || 
        normalizedShapeName === subdivisionWithVariations ||
        shapeWithVariations === normalizedSubdivisionName ||
        // Try without spaces/dashes
        shapeWithVariations.replace(/[-\s]/g, '') === subdivisionWithVariations.replace(/[-\s]/g, '') ||
        normalizedShapeName.replace(/[-\s]/g, '') === normalizedSubdivisionName.replace(/[-\s]/g, '')) {
      return subdivision;
    }
  }
  
  // Try fuzzy matching for remaining cases
  for (const subdivision of subdivisions) {
    const normalizedSubdivisionName = normalizeNameForMatching(subdivision.nameFr);
    
    // Check if the shape name contains the subdivision name or vice versa
    const shapeCore = normalizedShapeName.replace(/[-\s]/g, '');
    const subdivisionCore = normalizedSubdivisionName.replace(/[-\s]/g, '');
    
    if (shapeCore.includes(subdivisionCore) || subdivisionCore.includes(shapeCore)) {
      // Additional validation to avoid false positives
      if (Math.abs(shapeCore.length - subdivisionCore.length) <= 3) {
        return subdivision;
      }
    }
  }
  
  return null;
}

// Process regions (ADM1)
async function processRegions(jsonData: ParsedData): Promise<void> {
  const geojsonPath = './geoBoundaries-CMR-ADM1.geojson';
  const outputPath = './geoBoundaries-CMR-ADM1-enhanced.geojson';
  
  console.log('\n=== PROCESSING REGIONS (ADM1) ===');
  
  const file = Bun.file(geojsonPath);
  const exists = await file.exists();
  assert(exists, `GeoJSON file not found: ${geojsonPath}`);
  
  const content = await file.text();
  const geojson: GeoJSON = JSON.parse(content);
  
  let matched = 0;
  let withArea = 0;
  let withPcode = 0;
  
  for (const feature of geojson.features) {
    const shapeName = feature.properties.shapeName;
    const matchedRegion = findMatchingRegion(shapeName, jsonData.regions);
    
    if (matchedRegion) {
      matched++;
      
      // Add area if available
      if (matchedRegion.area) {
        feature.properties.area = matchedRegion.area;
        withArea++;
      }
      
      // Add pcode if available
      if (matchedRegion.pcode) {
        feature.properties.pcode = matchedRegion.pcode;
        withPcode++;
      }
      
      // console.log(`✅ "${shapeName}" → matched "${matchedRegion.nameFr}" (area: ${matchedRegion.area || 'N/A'}, pcode: ${matchedRegion.pcode || 'N/A'})`);
    } else {
      const decodedName = decodeGeoJSONName(shapeName);
      console.log(`❌ REGION "${shapeName}" (decoded: "${decodedName}") → NO MATCH FOUND`);
    }
  }
  
  console.log(`\nRegions Summary: ${matched}/${geojson.features.length} matched, ${withArea} with area, ${withPcode} with pcode`);
  
  // Save enhanced GeoJSON
  await Bun.write(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`✅ Enhanced regions saved to: ${outputPath}`);
}

// Process divisions (ADM2)
async function processDivisions(jsonData: ParsedData): Promise<void> {
  const geojsonPath = './geoBoundaries-CMR-ADM2.geojson';
  const outputPath = './geoBoundaries-CMR-ADM2-enhanced.geojson';
  
  console.log('\n=== PROCESSING DIVISIONS (ADM2) ===');
  
  const file = Bun.file(geojsonPath);
  const exists = await file.exists();
  assert(exists, `GeoJSON file not found: ${geojsonPath}`);
  
  const content = await file.text();
  const geojson: GeoJSON = JSON.parse(content);
  
  let matched = 0;
  let withArea = 0;
  let withPcode = 0;
  
  for (const feature of geojson.features) {
    const shapeName = feature.properties.shapeName;
    const matchedDivision = findMatchingDivision(shapeName, jsonData.divisions);
    
    if (matchedDivision) {
      matched++;
      
      // Add area if available
      if (matchedDivision.area) {
        feature.properties.area = matchedDivision.area;
        withArea++;
      }
      
      // Add pcode if available
      if (matchedDivision.pcode) {
        feature.properties.pcode = matchedDivision.pcode;
        withPcode++;
      }
      
      // console.log(`✅ "${shapeName}" → matched "${matchedDivision.nameFr}" (area: ${matchedDivision.area || 'N/A'}, pcode: ${matchedDivision.pcode || 'N/A'})`);
    } else {
      const decodedName = decodeGeoJSONName(shapeName);
      console.log(`❌ DIVISION "${shapeName}" (decoded: "${decodedName}") → NO MATCH FOUND`);
    }
  }
  
  console.log(`\nDivisions Summary: ${matched}/${geojson.features.length} matched, ${withArea} with area, ${withPcode} with pcode`);
  
  // Save enhanced GeoJSON
  await Bun.write(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`✅ Enhanced divisions saved to: ${outputPath}`);
}

// Process subdivisions (ADM3)
async function processSubdivisions(jsonData: ParsedData): Promise<void> {
  const geojsonPath = './geoBoundaries-CMR-ADM3.geojson';
  const outputPath = './geoBoundaries-CMR-ADM3-enhanced.geojson';
  
  console.log('\n=== PROCESSING SUBDIVISIONS (ADM3) ===');
  
  const file = Bun.file(geojsonPath);
  const exists = await file.exists();
  assert(exists, `GeoJSON file not found: ${geojsonPath}`);
  
  const content = await file.text();
  const geojson: GeoJSON = JSON.parse(content);
  
  let matched = 0;
  let withArea = 0;
  let withPcode = 0;
  
  for (const feature of geojson.features) {
    const shapeName = feature.properties.shapeName;
    const matchedSubdivision = findMatchingSubdivision(shapeName, jsonData.subdivisions);
    
    if (matchedSubdivision) {
      matched++;
      
      // Add area if available
      if (matchedSubdivision.area) {
        feature.properties.area = matchedSubdivision.area;
        withArea++;
      }
      
      // Add pcode if available
      if (matchedSubdivision.pcode) {
        feature.properties.pcode = matchedSubdivision.pcode;
        withPcode++;
      }
      
      // console.log(`✅ SUBDIVISION "${shapeName}" → matched "${matchedSubdivision.nameFr}"`);
    } else {
      const decodedName = decodeGeoJSONName(shapeName);
      console.log(`❌ SUBDIVISION "${shapeName}" (decoded: "${decodedName}") → NO MATCH FOUND`);
    }
  }
  
  console.log(`\nSubdivisions Summary: ${matched}/${geojson.features.length} matched, ${withArea} with area, ${withPcode} with pcode`);
  
  // Save enhanced GeoJSON
  await Bun.write(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`✅ Enhanced subdivisions saved to: ${outputPath}`);
}

// Main execution
async function main() {
  const jsonPath = './cameroon_locations_complete.json';
  
  try {
    console.log('Loading JSON data...');
    const jsonFile = Bun.file(jsonPath);
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, `JSON file not found: ${jsonPath}`);
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log(`Loaded data: ${jsonData.regions.length} regions, ${jsonData.divisions.length} divisions, ${jsonData.subdivisions.length} subdivisions`);
    
    // Process all three admin levels
    await processRegions(jsonData);
    await processDivisions(jsonData);
    await processSubdivisions(jsonData);
    
    console.log('\n🎉 ALL GEOJSON FILES PROCESSED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 