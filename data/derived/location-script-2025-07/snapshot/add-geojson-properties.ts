import assert from 'assert';

// Interfaces matching the JSON structure
interface PopulationData {
  total: number;
  male: number;
  female: number;
}

interface Region {
  nameFr: string;
  nameEn: string;
  code: string;
  population: PopulationData;
  hasc?: string;
  pcode?: string;
  area?: number;
}

interface Division {
  nameFr: string;
  nameEn: string;
  code: string;
  regionCode: string;
  population: PopulationData;
  hasc?: string;
  pcode?: string;
  area?: number;
}

interface Subdivision {
  nameFr: string;
  nameEn: string;
  code: string;
  divisionCode: string;
  population: PopulationData;
  pcode?: string;
  area?: number;
  councilNameFr?: string;
  councilNameEn?: string;
}

interface ParsedData {
  regions: Region[];
  divisions: Division[];
  subdivisions: Subdivision[];
  cantons: any[];
  neighborhoodsOrVillages: any[];
  blocks: any[];
}

// GeoJSON interfaces
interface GeoJSONFeature {
  type: string;
  properties: {
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: string;
    area?: number;
    pcode?: string;
  };
  geometry: any;
}

interface GeoJSON {
  type: string;
  features: GeoJSONFeature[];
}

// Decode GeoJSON names (handle encoding issues)
function decodeGeoJSONName(name: string): string {
  return name
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
    .replace(/^Ãd/g, 'Ed');  // Ãdéa -> Edéa
}

// Normalize names for matching
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
    // Normalize spaces and dashes
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  return normalized;
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

// Process subdivisions (ADM3)
async function processSubdivisions(jsonData: ParsedData): Promise<void> {
  const geojsonPath = './geoBoundaries-CMR-ADM3.geojson';
  const outputPath = './geoBoundaries-CMR-ADM3-enhanced.geojson';
  
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
      
      console.log(`✅ SUBDIVISION "${shapeName}" → matched "${matchedSubdivision.nameFr}" (council: ${matchedSubdivision.councilNameFr})`);
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

// Main function
async function main(): Promise<void> {
  try {
    console.log('🚀 Adding GeoJSON properties to location data...\n');

    // Read the JSON data
    const jsonFile = Bun.file('./cameroon_locations_complete.json');
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, 'JSON file not found: ./cameroon_locations_complete.json');
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log(`📊 Loaded data: ${jsonData.subdivisions.length} subdivisions`);
    
    // Process subdivisions only (since that's what we're focusing on)
    await processSubdivisions(jsonData);
    
    console.log('\n🎉 GeoJSON properties added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}