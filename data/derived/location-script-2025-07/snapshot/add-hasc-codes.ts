import assert from 'assert';

// Interfaces matching the current JSON structure
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
}

interface Division {
  nameFr: string;
  nameEn: string;
  code: string;
  regionCode: string;
  population: PopulationData;
  hasc?: string;
}

interface Subdivision {
  nameFr: string;
  nameEn: string;
  code: string;
  divisionCode: string;
  population: PopulationData;
}

interface Canton {
  nameFr: string;
  nameEn: string;
  code: string;
  type: 'city' | 'rural' | 'group' | 'lamidat' | 'sultanate' | 'sector' | 'chiefdom' | 'canton';
  subdivisionCode: string;
  population: PopulationData;
}

interface NeighborhoodOrVillage {
  nameFr: string;
  nameEn: string;
  code: string;
  type: 'neighborhood' | 'village' | 'locality';
  cantonCode: string;
  population: PopulationData;
}

interface Block {
  nameFr: string;
  nameEn: string;
  code: string;
  neighborhoodOrVillageCode: string;
}

interface ParsedData {
  regions: Region[];
  divisions: Division[];
  subdivisions: Subdivision[];
  cantons: Canton[];
  neighborhoodsOrVillages: NeighborhoodOrVillage[];
  blocks: Block[];
}

interface HASCEntry {
  divisionName: string;
  fullHASC: string;    // CM.NW.MC
  shortHASC: string;   // NW.MC
}

// Parse HASC CSV file
async function parseHASCCSV(filePath: string): Promise<HASCEntry[]> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `HASC CSV file not found: ${filePath}`);

  const content = await file.text();
  const lines = content.split('\n');
  
  const hascEntries: HASCEntry[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith(',,')) {
      continue; // Skip empty lines or lines with just commas
    }
    
    const parts = trimmedLine.split(',');
    if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
      hascEntries.push({
        divisionName: parts[0].trim(),
        fullHASC: parts[1].trim(),
        shortHASC: parts[2].trim()
      });
    }
  }
  
  console.log(`Loaded ${hascEntries.length} HASC entries from CSV`);
  return hascEntries;
}

// Normalize names for matching (handle case, dashes, accents)
function normalizeNameForMatching(name: string): string {
  return name
    .toUpperCase()
    .replace(/[ÀÁÂÃÄÅ]/g, 'A')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .replace(/[ÇÇ]/g, 'C')
    .replace(/[ÑÑ]/g, 'N')
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Find HASC entry for a division
function findHASCForDivision(divisionName: string, hascEntries: HASCEntry[]): HASCEntry | null {
  // Handle specific name conversions first
  let processedName = divisionName;
  if (processedName.toUpperCase() === "FARO-ET-DEO" || processedName.toUpperCase() === "FARO-ET-DÉO") {
    processedName = "Faro-Deo";
  } else if (processedName.toUpperCase() === "KUPE-ET-MANENGUBA" || processedName.toUpperCase() === "KOUPÉ-ET-MANENGUBA") {
    processedName = "Koupé-Manengouba";
  }
  
  const normalizedDivisionName = normalizeNameForMatching(processedName);
  
  // Try exact match first
  for (const entry of hascEntries) {
    const normalizedEntryName = normalizeNameForMatching(entry.divisionName);
    if (normalizedEntryName === normalizedDivisionName) {
      return entry;
    }
  }
  
  // Try partial matches for common variations
  for (const entry of hascEntries) {
    const normalizedEntryName = normalizeNameForMatching(entry.divisionName);
    
    // Handle "ET" vs "AND" variations
    const divisionWithEt = normalizedDivisionName.replace(/-ET-/g, '-AND-');
    const entryWithEt = normalizedEntryName.replace(/-ET-/g, '-AND-');
    
    if (divisionWithEt === entryWithEt || 
        normalizedDivisionName === entryWithEt ||
        divisionWithEt === normalizedEntryName) {
      return entry;
    }
  }
  
  return null;
}

// Extract region HASC from division HASC (CM.NW.MC → CM.NW)
function extractRegionHASC(divisionHASC: string): string {
  const parts = divisionHASC.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`; // CM.NW
  }
  return '';
}

// Add HASC codes to the JSON data
async function addHASCCodesToJSON(jsonData: ParsedData, hascEntries: HASCEntry[]): Promise<ParsedData> {
  console.log('\n=== ADDING HASC CODES ===');
  
  // Track region HASC codes from divisions
  const regionHASCMap = new Map<string, string>();
  
  // Add HASC codes to divisions
  let divisionsWithHASC = 0;
  for (const division of jsonData.divisions) {
    const hascEntry = findHASCForDivision(division.nameFr, hascEntries);
    
    if (hascEntry) {
      division.hasc = hascEntry.fullHASC;
      divisionsWithHASC++;
      
      // Extract region HASC
      const regionHASC = extractRegionHASC(hascEntry.fullHASC);
      if (regionHASC) {
        regionHASCMap.set(division.regionCode, regionHASC);
      }
      
      console.log(`✅ Division "${division.nameFr}" → ${hascEntry.fullHASC}`);
    } else {
      console.log(`❌ Division "${division.nameFr}" → NO HASC FOUND`);
    }
  }
  
  // Add HASC codes to regions
  let regionsWithHASC = 0;
  for (const region of jsonData.regions) {
    const regionHASC = regionHASCMap.get(region.code);
    
    if (regionHASC) {
      region.hasc = regionHASC;
      regionsWithHASC++;
      console.log(`✅ Region "${region.nameFr}" → ${regionHASC}`);
    } else {
      console.log(`❌ Region "${region.nameFr}" → NO HASC FOUND`);
    }
  }
  
  // Summary
  console.log('\n=== HASC CODE SUMMARY ===');
  console.log(`Divisions with HASC: ${divisionsWithHASC}/${jsonData.divisions.length}`);
  console.log(`Regions with HASC: ${regionsWithHASC}/${jsonData.regions.length}`);
  
  // Log missing HASC codes
  const divisionsWithoutHASC = jsonData.divisions.filter(d => !d.hasc);
  const regionsWithoutHASC = jsonData.regions.filter(r => !r.hasc);
  
  if (divisionsWithoutHASC.length > 0) {
    console.log('\n⚠️  DIVISIONS WITHOUT HASC CODES:');
    divisionsWithoutHASC.forEach(division => {
      console.log(`  - "${division.nameFr}" (code: ${division.code})`);
    });
  }
  
  if (regionsWithoutHASC.length > 0) {
    console.log('\n⚠️  REGIONS WITHOUT HASC CODES:');
    regionsWithoutHASC.forEach(region => {
      console.log(`  - "${region.nameFr}" (code: ${region.code})`);
    });
  }
  
  if (divisionsWithoutHASC.length === 0 && regionsWithoutHASC.length === 0) {
    console.log('\n🎉 ALL REGIONS AND DIVISIONS HAVE HASC CODES!');
  }
  
  return jsonData;
}

// Main execution
async function main() {
  const jsonPath = './cameroon_locations_with_population.json';
  const hascPath = './hasc-code.csv';
  const outputPath = './cameroon_locations_with_hasc.json';
  
  try {
    console.log('Loading JSON data...');
    const jsonFile = Bun.file(jsonPath);
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, `JSON file not found: ${jsonPath}`);
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log('Loading HASC codes...');
    const hascEntries = await parseHASCCSV(hascPath);
    
    console.log('Adding HASC codes to JSON data...');
    const updatedData = await addHASCCodesToJSON(jsonData, hascEntries);
    
    console.log('Saving updated JSON...');
    await Bun.write(outputPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`\n✅ Updated JSON saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();