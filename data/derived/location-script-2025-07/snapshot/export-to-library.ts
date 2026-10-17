#!/usr/bin/env bun

/**
 * Export location data to cameroon-locations library format
 * Transforms the output from the location-script pipeline into TypeScript files
 * for the cameroon-locations library
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Type definitions for input data
interface LocationItem {
  nameFr: string;
  nameEn: string;
  code: string;
  population?: {
    total: number;
    male: number;
    female: number;
  };
  hasc?: string;
  pcode?: string;
  area?: number;
  councilNameFr?: string;
  councilNameEn?: string;
  divisionCode?: string;
  regionCode?: string;
  [key: string]: any;
}

interface ElecamData {
  metadata: {
    version: string;
    generatedAt: string;
    totalCouncils: number;
    totalCenters: number;
    totalStations: number;
    totalVoters: number;
    coverage: string;
    source: string;
  };
  councils: Council[];
}

interface Council {
  subdivisionCode: string;
  councilName: string;
  totalVoters: number;
  totalCenters: number;
  totalStations: number;
  votersPerStation: number;
  pollingCenters: PollingCenter[];
}

interface PollingCenter {
  centerName: string;
  totalVoters: number;
  stations: PollingStation[];
}

interface PollingStation {
  stationName: string;
  voterCount: number;
}

interface GeoJsonFeature {
  type: string;
  properties: {
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: 'ADM1' | 'ADM2' | 'ADM3';
    area: number;
    pcode: string;
  };
  geometry: any;
}

// Output type definitions (matching library interfaces)
interface RegionData {
  nameFr: string;
  nameEn: string;
  code: number;
  hasc?: string;
  pcode?: string;
}

interface DivisionData {
  nameFr: string;
  nameEn: string;
  code: number;
  hasc?: string;
  pcode?: string;
  region: string;
  regionCode: number;
}

interface SubdivisionData {
  nameFr: string;
  nameEn: string;
  code: number;
  hasc?: string;
  pcode?: string;
  councilNameFr?: string;
  councilNameEn?: string;
  division: string;
  divisionCode: number;
}

interface CantonData {
  nameFr: string;
  nameEn: string;
  code: number;
  type: 'city' | 'rural' | 'group' | 'lamidat' | 'sultanate' | 'sector' | 'chiefdom' | 'canton';
  subdivision: string;
  subdivisionCode: number;
}

interface NeighborhoodOrVillageData {
  nameFr: string;
  nameEn: string;
  code: number;
  type: 'neighborhood' | 'village' | 'locality';
  population?: {
    total: number;
    male: number;
    female: number;
  };
  canton: string;
  cantonCode: number;
}

interface BlockData {
  nameFr: string;
  nameEn: string;
  code: number;
  neighborhoodOrVillage: string;
  neighborhoodOrVillageCode: number;
}

// Helper function to ensure code format consistency
function formatCode(code: string, level: string): number {
  // Remove any non-numeric characters for standardization
  const numericCode = code.replace(/\D/g, '');
  
  // Pad with zeros if needed based on level, then convert to number
  let paddedCode: string;
  switch(level) {
    case 'region':
      paddedCode = numericCode.padStart(2, '0');
      break;
    case 'division':
      paddedCode = numericCode.padStart(4, '0');
      break;
    case 'subdivision':
      paddedCode = numericCode.padStart(6, '0');
      break;
    case 'canton':
      paddedCode = numericCode.padStart(6, '0'); // Same as subdivision for now
      break;
    case 'neighborhoodOrVillage':
      paddedCode = numericCode.padStart(8, '0');
      break;
    case 'block':
      paddedCode = numericCode.padStart(10, '0');
      break;
    default:
      paddedCode = numericCode;
  }
  
  return parseInt(paddedCode, 10);
}

// Helper function to convert UPPERCASE names to proper case
function toProperCase(name: string): string {
  if (!name) return name;
  
  // Handle special cases and common patterns
  return name
    .toLowerCase()
    .split(/[\s-]/)
    .map(word => {
      // Handle Roman numerals
      if (/^[ivx]+$/.test(word)) {
        return word.toUpperCase();
      }
      // Handle common abbreviations
      if (['et', 'de', 'du', 'des', 'le', 'la', 'les'].includes(word)) {
        return word;
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(name.includes('-') ? '-' : ' ');
}

// Helper function to ensure English name exists
function ensureEnglishName(nameFr: string, nameEn: string): string {
  return nameEn && nameEn.trim() ? nameEn : toProperCase(nameFr);
}

// Helper to parse population data
function parsePopulation(population: any): { total: number; male: number; female: number } | undefined {
  if (!population) return undefined;
  
  if (typeof population === 'number') {
    // Simple number - split evenly between male/female
    return {
      total: population,
      male: Math.floor(population / 2),
      female: Math.ceil(population / 2)
    };
  }
  
  if (typeof population === 'object' && population.total) {
    return {
      total: population.total,
      male: population.male || Math.floor(population.total / 2),
      female: population.female || Math.ceil(population.total / 2)
    };
  }
  
  return undefined;
}

// Main export function
async function exportToLibrary() {
  try {
    console.log('📖 Reading cameroon_locations_complete.json...');
    const locationsData = JSON.parse(
      await readFile(path.resolve(process.cwd(), 'cameroon_locations_complete.json'), 'utf-8')
    );

    // The JSON is structured as arrays by type
    const regions = locationsData.regions || [];
    const divisions = locationsData.divisions || [];
    const subdivisions = locationsData.subdivisions || [];
    const neighborhoodsOrVillages = locationsData.neighborhoodsOrVillages || [];
    const blocks = locationsData.blocks || [];

    console.log(`✅ Loaded data:
  - ${regions.length} regions
  - ${divisions.length} divisions
  - ${subdivisions.length} subdivisions
  - ${neighborhoodsOrVillages.length} neighborhoods/villages
  - ${blocks.length} blocks`);

    // Build separate lookup maps for each administrative level
    const regionByCode = new Map<string, LocationItem>();
    const divisionByCode = new Map<string, LocationItem>();
    const subdivisionByCode = new Map<string, LocationItem>();
    
    regions.forEach(item => regionByCode.set(item.code.toString(), item));
    divisions.forEach(item => divisionByCode.set(item.code.toString(), item));
    subdivisions.forEach(item => subdivisionByCode.set(item.code.toString(), item));

    // Process each administrative level
    const processedRegions = processRegions(regions);
    const processedDivisions = processDivisions(divisions, regionByCode);
    const processedSubdivisions = processSubdivisions(subdivisions, divisionByCode);
    const processedCantons = processCantons(processedSubdivisions); // Generate from subdivisions
    const processedNeighborhoodsOrVillages = processNeighborhoodsOrVillages(
      neighborhoodsOrVillages, 
      subdivisionByCode,
      processedCantons
    );
    const processedBlocks = processBlocks(blocks, subdivisionByCode);

    // Write core data files
    await writeDataFile('regions', processedRegions, 'RegionData');
    await writeDataFile('divisions', processedDivisions, 'DivisionData');
    await writeDataFile('subdivisions', processedSubdivisions, 'SubdivisionData');
    await writeDataFile('cantons', processedCantons, 'CantonData');
    await writeDataFile('neighborhoodsOrVillages', processedNeighborhoodsOrVillages, 'NeighborhoodOrVillageData');
    await writeDataFile('blocks', processedBlocks, 'BlockData');

    // Process and write extension data
    await processElectoralData();
    await processGeoJsonData();

    console.log('\n✅ Export completed successfully!');

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// Process regions
function processRegions(regions: LocationItem[]): RegionData[] {
  return regions
    .map(region => ({
      nameFr: toProperCase(region.nameFr),
      nameEn: ensureEnglishName(region.nameFr, region.nameEn),
      code: formatCode(region.code, 'region'),
      hasc: region.hasc,
      pcode: region.pcode
    }))
    .sort((a, b) => a.code - b.code);
}

// Process divisions
function processDivisions(divisions: LocationItem[], regionByCode: Map<string, LocationItem>): DivisionData[] {
  return divisions
    .map(division => {
      const parent = division.regionCode ? regionByCode.get(division.regionCode.toString()) : null;
      if (!parent && division.regionCode) {
        console.warn(`⚠️  No parent found for division: ${division.nameFr} (regionCode: ${division.regionCode})`);
      }
      
      // Use the original code from the source data
      const divisionCode = formatCode(division.code, 'division');
      
      return {
        nameFr: toProperCase(division.nameFr),
        nameEn: ensureEnglishName(division.nameFr, division.nameEn),
        code: divisionCode,
        hasc: division.hasc,
        pcode: division.pcode,
        region: parent ? toProperCase(parent.nameFr) : 'Unknown',
        regionCode: formatCode(parent?.code || '00', 'region')
      };
    })
    .sort((a, b) => a.code - b.code);
}

// Process subdivisions (districts)
function processSubdivisions(districts: LocationItem[], divisionByCode: Map<string, LocationItem>): SubdivisionData[] {
  return districts
    .map(district => {
      const parent = district.divisionCode ? divisionByCode.get(district.divisionCode.toString()) : null;
      if (!parent && district.divisionCode) {
        console.warn(`⚠️  No parent found for subdivision: ${district.nameFr} (divisionCode: ${district.divisionCode})`);
      }
      
      // Use the original code from the source data
      const subdivisionCode = formatCode(district.code, 'subdivision');
      
      return {
        nameFr: toProperCase(district.nameFr),
        nameEn: ensureEnglishName(district.nameFr, district.nameEn),
        code: subdivisionCode,
        hasc: district.hasc,
        pcode: district.pcode,
        councilNameFr: district.councilNameFr,
        councilNameEn: district.councilNameEn || district.councilNameFr,
        division: parent ? toProperCase(parent.nameFr) : 'Unknown',
        divisionCode: parent ? formatCode(parent.code, 'division') : 0
      };
    })
    .sort((a, b) => a.code - b.code);
}

// Generate cantons from subdivisions (1:1 mapping for now)
function processCantons(subdivisions: SubdivisionData[]): CantonData[] {
  return subdivisions
    .map(sub => ({
      nameFr: sub.nameFr, // Already processed
      nameEn: sub.nameEn, // Already processed
      code: sub.code, // Same code as subdivision for now
      type: determineCantonType(sub.nameFr),
      subdivision: sub.nameFr,
      subdivisionCode: sub.code
    }))
    .sort((a, b) => a.code - b.code);
}

// Determine canton type based on name patterns
function determineCantonType(name: string): CantonData['type'] {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('ville') || nameLower.includes('city') || 
      nameLower.includes('urban') || nameLower.includes('douala') || 
      nameLower.includes('yaoundé') || nameLower.includes('bamenda') ||
      nameLower.includes('bafoussam') || nameLower.includes('garoua')) {
    return 'city';
  }
  
  if (nameLower.includes('lamidat')) return 'lamidat';
  if (nameLower.includes('sultanat')) return 'sultanate';
  if (nameLower.includes('chefferie') || nameLower.includes('chiefdom')) return 'chiefdom';
  if (nameLower.includes('groupement') || nameLower.includes('group')) return 'group';
  if (nameLower.includes('canton')) return 'canton';
  
  return 'rural';
}

// Process neighborhoods/villages
function processNeighborhoodsOrVillages(
  items: LocationItem[], 
  _subdivisionByCode: Map<string, LocationItem>,
  cantons: CantonData[]
): NeighborhoodOrVillageData[] {
  return items
    .map(item => {
      // For now, assume neighborhoods/villages don't have proper parent relationships in the data
      // We'll use the first canton as a fallback
      const canton = cantons[0] || { nameFr: 'Unknown', code: 0 };
      
      return {
        nameFr: toProperCase(item.nameFr),
        nameEn: ensureEnglishName(item.nameFr, item.nameEn),
        code: formatCode(item.code, 'neighborhoodOrVillage'),
        type: determineNeighborhoodType(item.nameFr),
        population: parsePopulation(item.population),
        canton: canton.nameFr,
        cantonCode: canton.code
      };
    })
    .sort((a, b) => a.code - b.code);
}

// Determine neighborhood/village type
function determineNeighborhoodType(name: string): 'neighborhood' | 'village' | 'locality' {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('quartier') || nameLower.includes('quarter') ||
      nameLower.includes('neighborhood')) {
    return 'neighborhood';
  }
  
  if (nameLower.includes('village') || nameLower.includes('hamlet')) {
    return 'village';
  }
  
  return 'locality';
}

// Process blocks
function processBlocks(blocks: LocationItem[], _subdivisionByCode: Map<string, LocationItem>): BlockData[] {
  return blocks
    .map(block => {
      return {
        nameFr: toProperCase(block.nameFr),
        nameEn: ensureEnglishName(block.nameFr, block.nameEn),
        code: formatCode(block.code, 'block'),
        neighborhoodOrVillage: 'Unknown',
        neighborhoodOrVillageCode: 0
      };
    })
    .sort((a, b) => a.code - b.code);
}

// Write data file
async function writeDataFile(
  name: string,
  data: any[],
  interfaceName: string
) {
  try {
    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), "../cameroon-locations/lib/data");
    await mkdir(outputDir, { recursive: true });
    
    const outputContent = `import type { ${interfaceName} } from "../types";

export const ${name}: ${interfaceName}[] = ${JSON.stringify(
    data,
    null,
    2
  )};
`;
    const outputPath = path.join(outputDir, `${name}.ts`);
    
    console.log(`📝 Writing ${data.length} items to ${outputPath}...`);
    await writeFile(outputPath, outputContent);
    console.log(`✅ Wrote ${data.length} items to ${path.relative(process.cwd(), outputPath)}`);
  } catch (error) {
    console.error(`❌ Failed to write ${name}:`, error);
    throw error;
  }
}

// Process electoral data
async function processElectoralData() {
  try {
    console.log('\n📊 Processing electoral data...');
    
    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), "../cameroon-locations/lib/extensions/elecam");
    await mkdir(outputDir, { recursive: true });
    
    const elecamData: ElecamData = JSON.parse(
      await readFile(path.resolve(process.cwd(), 'elecam_polling_stations.json'), 'utf-8')
    );

    // Load subdivision data for mapping
    const locationsData = JSON.parse(
      await readFile(path.resolve(process.cwd(), 'cameroon_locations_complete.json'), 'utf-8')
    );
    
    // Update subdivision codes to match our library format (use original codes, not pcodes)
    const electoralData = {
      ...elecamData,
      councils: elecamData.councils.map(council => {
        // Find the subdivision that matches this council by name
        const subdivision = locationsData.subdivisions.find((sub: any) => 
          sub.councilNameFr === council.councilName || 
          sub.nameFr === council.councilName
        );
        
        // Use the subdivision's original code as numeric (e.g., 1, 200) not the pcode
        let subdivisionCode = council.subdivisionCode;
        if (subdivision) {
          subdivisionCode = parseInt(subdivision.code, 10); // Convert to numeric to match library format
        }
        
        return {
          ...council,
          subdivisionCode
        };
      })
    };

    // Write electoral data file
    const content = `import type { ElectoralData, Council } from "./types";

// Electoral data populated from ELECAM
export const electoralData: ElectoralData = ${JSON.stringify(electoralData, null, 2)};

// Lookup map for fast access by subdivision code
export const councilBySubdivisionCode = new Map<string, Council>();

// Initialize lookup map when data is loaded
function initializeLookupMaps() {
  councilBySubdivisionCode.clear();
  for (const council of electoralData.councils) {
    councilBySubdivisionCode.set(council.subdivisionCode, council);
  }
}

// Initialize maps
initializeLookupMaps();

/**
 * Get electoral data for a subdivision by its code
 */
export function getElectoralDataBySubdivisionCode(subdivisionCode: string): Council | undefined {
  return councilBySubdivisionCode.get(subdivisionCode);
}
`;

    const filePath = path.join(outputDir, "data.ts");
    await writeFile(filePath, content);
    console.log(`✅ Exported ${electoralData.councils.length} electoral councils to lib/extensions/elecam/data.ts`);

  } catch (error) {
    console.error('⚠️  Failed to process electoral data:', error);
  }
}

// Process GeoJSON data
async function processGeoJsonData() {
  try {
    console.log('\n🗺️  Processing GeoJSON data...');
    
    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), "../cameroon-locations/lib/extensions/geojson");
    await mkdir(outputDir, { recursive: true });
    
    const features: GeoJsonFeature[] = [];
    
    // Load all three enhanced GeoJSON files
    for (const level of ['ADM1', 'ADM2', 'ADM3']) {
      const filename = `geoBoundaries-CMR-${level}-enhanced.geojson`;
      console.log(`  Loading ${filename}...`);
      
      const geoData = JSON.parse(
        await readFile(path.resolve(process.cwd(), filename), 'utf-8')
      );
      
      if (geoData.features) {
        features.push(...geoData.features);
        console.log(`  ✓ Loaded ${geoData.features.length} ${level} features`);
      }
    }

    const geoJsonData = {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      features
    };

    // Write GeoJSON data file
    const content = `import type { GeoJsonFeatureCollection, GeoJsonFeature, BoundingBox } from "./types";

// GeoJSON data populated from enhanced geoBoundaries files
export const geoJsonData: GeoJsonFeatureCollection = ${JSON.stringify(geoJsonData, null, 2)};

// Lookup maps for fast access by pcode
export const featureByPcode = new Map<string, GeoJsonFeature>();

// Initialize lookup maps when data is loaded
function initializeLookupMaps() {
  featureByPcode.clear();
  for (const feature of geoJsonData.features) {
    featureByPcode.set(feature.properties.pcode, feature);
  }
}

// Initialize maps
initializeLookupMaps();

/**
 * Get GeoJSON feature for a location by its pcode
 */
export function getGeoJsonByPcode(pcode: string): GeoJsonFeature | undefined {
  return featureByPcode.get(pcode);
}

/**
 * Calculate bounding box from coordinates
 */
export function calculateBounds(coordinates: number[][][]): BoundingBox {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  function processCoordinates(coords: number[][]) {
    for (const [lng, lat] of coords) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }

  // Handle both Polygon and MultiPolygon
  if (coordinates[0] && Array.isArray(coordinates[0][0])) {
    // Polygon: coordinates[0] is the outer ring
    processCoordinates(coordinates[0] as number[][]);
  }

  return { minLng, minLat, maxLng, maxLat };
}
`;

    const filePath = path.join(outputDir, "data.ts");
    await writeFile(filePath, content);
    console.log(`✅ Exported ${features.length} GeoJSON features to lib/extensions/geojson/data.ts`);

  } catch (error) {
    console.error('⚠️  Failed to process GeoJSON data:', error);
  }
}

// Run the export
exportToLibrary().catch(console.error); 