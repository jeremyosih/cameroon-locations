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

interface PCodeEntry {
  englishName: string;
  frenchName: string;
  pcode: string;
  area?: number;
}

interface DivisionPCodeEntry {
  frenchName: string;
  pcode: string;
  area: number;
}

interface SubdivisionPCodeEntry {
  frenchName: string;
  pcode: string;
  area: number;
}

// Parse P-code CSV file
async function parsePCodeCSV(filePath: string): Promise<PCodeEntry[]> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `P-code CSV file not found: ${filePath}`);

  const content = await file.text();
  const lines = content.split('\n');
  
  const pcodeEntries: PCodeEntry[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
      pcodeEntries.push({
        englishName: parts[0].trim().toUpperCase(), // Ensure uppercase
        frenchName: parts[1].trim().toUpperCase(), // Ensure uppercase
        pcode: parts[2].trim(),
        area: parseFloat(parts[3].trim())
      });
    }
  }
  
  console.log(`Loaded ${pcodeEntries.length} P-code entries from CSV`);
  return pcodeEntries;
}

// Parse Division P-code CSV file
async function parseDivisionPCodeCSV(filePath: string): Promise<DivisionPCodeEntry[]> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `Division P-code CSV file not found: ${filePath}`);

  const content = await file.text();
  const lines = content.split('\n');
  
  const pcodeEntries: DivisionPCodeEntry[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4 && parts[0] && parts[1] && parts[3]) {
      pcodeEntries.push({
        frenchName: parts[0].trim().toUpperCase(), // Ensure uppercase
        pcode: parts[1].trim(),
        area: parseFloat(parts[3].trim())
      });
    }
  }
  
  console.log(`Loaded ${pcodeEntries.length} division P-code entries from CSV`);
  return pcodeEntries;
}

// Parse Subdivision P-code CSV file
async function parseSubdivisionPCodeCSV(filePath: string): Promise<SubdivisionPCodeEntry[]> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `Subdivision P-code CSV file not found: ${filePath}`);

  const content = await file.text();
  const lines = content.split('\n');
  
  const pcodeEntries: SubdivisionPCodeEntry[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
      pcodeEntries.push({
        frenchName: parts[0].trim().toUpperCase(), // Ensure uppercase
        pcode: parts[1].trim(),
        area: parseFloat(parts[2].trim())
      });
    }
  }
  
  console.log(`Loaded ${pcodeEntries.length} subdivision P-code entries from CSV`);
  return pcodeEntries;
}

// Normalize names for matching (handle case, dashes, accents)
function normalizeNameForMatching(name: string): string {
  let normalized = name
    .toUpperCase()
    // Handle accents and special characters
    .replace(/[ÀÁÂÃÄÅ]/g, 'A')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .replace(/[ÇÇ]/g, 'C')
    .replace(/[ÑÑ]/g, 'N')
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
    // Handle common spelling variations
    .replace(/BATSCHENGA/g, 'BATCHENGA')
    .replace(/EZENDOUAN/g, 'EDZENDOUAN')
    .replace(/MAKARI/g, 'MAKARY')
    .replace(/KARHAY/g, 'KAR-HAY')
    .replace(/SANCHOU/g, 'SANTCHOU')
    .replace(/MALENTOUEN/g, 'MALANTOUEN')
    .replace(/MASSANGAN/g, 'MASSANGAM')
    .replace(/MUYAKA/g, 'MUYUKA')
    .replace(/MANFE/g, 'MAMFE')
    .replace(/UPPER-BANYANG/g, 'UPPER-BAYANG')
    .replace(/DIKOMBA-BALUE/g, 'DIKOME-BALUE')
    .replace(/MASSOK-SONGLOULOU/g, 'MASSOCK-SONGLOULOU')
    .replace(/MVANGAN/g, 'MVANGANE')
    .replace(/NGAN-HA/g, 'NGANHA')
    .replace(/EDEA/g, 'EDEA') // Handle É -> E
    .replace(/EBOLOWA/g, 'EBOLOWA') // Handle É -> E
    .replace(/BAMENDA-([IVX]+)/g, 'BAMENDA-$1')
    .replace(/BAMENDA-(\d+)/g, 'BAMENDA-$1')
    // Handle prefixes and suffixes
    .replace(/^ABO-FIKO$/g, 'FIKO')
    .replace(/^WIDIKUM-MENKA$/g, 'WIDIKUM')
    .replace(/^MANFE-CENTRAL$/g, 'MAMFE')
    .replace(/^UPPER-BANYANG$/g, 'UPPER-BAYANG')
    // Normalize spaces and dashes
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  return normalized;
}

// Find P-code entry for a region
function findPCodeForRegion(regionName: string, pcodeEntries: PCodeEntry[]): PCodeEntry | null {
  const normalizedRegionName = normalizeNameForMatching(regionName);
  
  // Try exact match with French name first
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    if (normalizedFrenchName === normalizedRegionName) {
      return entry;
    }
  }
  
  // Try partial matches for common variations
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    
    // Handle common variations
    const regionWithVariations = normalizedRegionName
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME');
    
    const entryWithVariations = normalizedFrenchName
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME');
    
    if (regionWithVariations === entryWithVariations || 
        normalizedRegionName === entryWithVariations ||
        regionWithVariations === normalizedFrenchName) {
      return entry;
    }
  }
  
  return null;
}

// Find P-code entry for a division
function findPCodeForDivision(divisionName: string, pcodeEntries: DivisionPCodeEntry[]): DivisionPCodeEntry | null {
  const normalizedDivisionName = normalizeNameForMatching(divisionName);
  
  // Try exact match first
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    if (normalizedFrenchName === normalizedDivisionName) {
      return entry;
    }
  }
  
  // Try partial matches for common variations
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    
    // Handle common variations
    const divisionWithVariations = normalizedDivisionName
      .replace(/NYONG-ET-SOO/g, 'NYONG-ET-SO')
      .replace(/KUPE-ET-MANENGUBA/g, 'KUPE-MANENGUBA')
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/-?ET-?/g, '-') // Handle ET variations
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    const entryWithVariations = normalizedFrenchName
      .replace(/NYONG-ET-SO/g, 'NYONG-ET-SOO')
      .replace(/KUPE-MANENGUBA/g, 'KUPE-ET-MANENGUBA')
      .replace(/EXTREME/g, 'EXTREM')
      .replace(/EXTREM/g, 'EXTREME')
      .replace(/-?ET-?/g, '-') // Handle ET variations
      .replace(/--+/g, '-'); // Clean up multiple dashes
    
    if (divisionWithVariations === entryWithVariations || 
        normalizedDivisionName === entryWithVariations ||
        divisionWithVariations === normalizedFrenchName) {
      return entry;
    }
  }
  
  return null;
}

// Find P-code entry for a subdivision
function findPCodeForSubdivision(subdivisionName: string, pcodeEntries: SubdivisionPCodeEntry[]): SubdivisionPCodeEntry | null {
  // Handle specific name conversions first
  let processedName = subdivisionName;
  if (processedName.toUpperCase() === "MANFE-CENTRAL" || processedName.toUpperCase() === "MANFE CENTRAL") {
    processedName = "MAMFE";
  }
  
  const normalizedSubdivisionName = normalizeNameForMatching(processedName);
  
  // Try exact match first
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    if (normalizedFrenchName === normalizedSubdivisionName) {
      return entry;
    }
  }
  
  // Try partial matches for common variations
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    
    // Handle common variations
    const subdivisionWithVariations = normalizedSubdivisionName
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
    
    const entryWithVariations = normalizedFrenchName
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
    
    if (subdivisionWithVariations === entryWithVariations || 
        normalizedSubdivisionName === entryWithVariations ||
        subdivisionWithVariations === normalizedFrenchName ||
        // Try without spaces/dashes
        subdivisionWithVariations.replace(/[-\s]/g, '') === entryWithVariations.replace(/[-\s]/g, '') ||
        normalizedSubdivisionName.replace(/[-\s]/g, '') === normalizedFrenchName.replace(/[-\s]/g, '')) {
      return entry;
    }
  }
  
  // Try fuzzy matching for remaining cases
  for (const entry of pcodeEntries) {
    const normalizedFrenchName = normalizeNameForMatching(entry.frenchName);
    
    // Check if the subdivision name contains the entry name or vice versa
    const subdivisionCore = normalizedSubdivisionName.replace(/[-\s]/g, '');
    const entryCore = normalizedFrenchName.replace(/[-\s]/g, '');
    
    if (subdivisionCore.includes(entryCore) || entryCore.includes(subdivisionCore)) {
      // Additional validation to avoid false positives
      if (Math.abs(subdivisionCore.length - entryCore.length) <= 3) {
        return entry;
      }
    }
  }
  
  return null;
}

// Add P-codes and English names to the JSON data
async function addPCodeAndEnglishToJSON(
  jsonData: ParsedData, 
  regionPcodeEntries: PCodeEntry[], 
  divisionPcodeEntries: DivisionPCodeEntry[], 
  subdivisionPcodeEntries: SubdivisionPCodeEntry[]
): Promise<ParsedData> {
  console.log('\n=== ADDING P-CODES AND ENGLISH NAMES ===');
  
  let regionsWithPCode = 0;
  let regionsWithEnglish = 0;
  let divisionsWithPCode = 0;
  let subdivisionsWithPCode = 0;
  
  // Add P-codes and English names to regions
  for (const region of jsonData.regions) {
    // Ensure region French name is uppercase
    region.nameFr = region.nameFr.toUpperCase();
    
    const pcodeEntry = findPCodeForRegion(region.nameFr, regionPcodeEntries);
    
    if (pcodeEntry) {
      // Add P-code and area
      region.pcode = pcodeEntry.pcode;
      region.area = pcodeEntry.area;
      regionsWithPCode++;
      
      // Add English name - already uppercase from parsing
      region.nameEn = pcodeEntry.englishName;
      regionsWithEnglish++;
      
      console.log(`✅ Region "${region.nameFr}" → P-code: ${pcodeEntry.pcode}, English: "${pcodeEntry.englishName}", Area: ${pcodeEntry.area} km²`);
    } else {
      console.log(`❌ Region "${region.nameFr}" → NO P-CODE/ENGLISH FOUND`);
    }
  }
  
  // Add P-codes and areas to divisions
  for (const division of jsonData.divisions) {
    // Ensure division French name is uppercase
    division.nameFr = division.nameFr.toUpperCase();
    
    const pcodeEntry = findPCodeForDivision(division.nameFr, divisionPcodeEntries);
    
    if (pcodeEntry) {
      // Add P-code and area
      division.pcode = pcodeEntry.pcode;
      division.area = pcodeEntry.area;
      divisionsWithPCode++;
      
      console.log(`✅ Division "${division.nameFr}" → P-code: ${pcodeEntry.pcode}, Area: ${pcodeEntry.area} km²`);
    } else {
      console.log(`❌ Division "${division.nameFr}" → NO P-CODE FOUND`);
    }
  }
  
  // Add P-codes and areas to subdivisions
  for (const subdivision of jsonData.subdivisions) {
    // Ensure subdivision French name is uppercase
    subdivision.nameFr = subdivision.nameFr.toUpperCase();
    
    const pcodeEntry = findPCodeForSubdivision(subdivision.nameFr, subdivisionPcodeEntries);
    
    if (pcodeEntry) {
      // Add P-code and area
      subdivision.pcode = pcodeEntry.pcode;
      subdivision.area = pcodeEntry.area;
      subdivisionsWithPCode++;
      
      console.log(`✅ Subdivision "${subdivision.nameFr}" → P-code: ${pcodeEntry.pcode}, Area: ${pcodeEntry.area} km²`);
    } else {
      console.log(`❌ Subdivision "${subdivision.nameFr}" → NO P-CODE FOUND`);
    }
  }
  
  // Summary
  console.log('\n=== P-CODE AND ENGLISH SUMMARY ===');
  console.log(`Regions with P-code: ${regionsWithPCode}/${jsonData.regions.length}`);
  console.log(`Regions with English names: ${regionsWithEnglish}/${jsonData.regions.length}`);
  console.log(`Divisions with P-code: ${divisionsWithPCode}/${jsonData.divisions.length}`);
  console.log(`Subdivisions with P-code: ${subdivisionsWithPCode}/${jsonData.subdivisions.length}`);
  
  // Log missing P-codes or English names
  const regionsWithoutPCode = jsonData.regions.filter(r => !r.pcode);
  const regionsWithoutEnglish = jsonData.regions.filter(r => !r.nameEn || r.nameEn === '');
  const divisionsWithoutPCode = jsonData.divisions.filter(d => !d.pcode);
  const subdivisionsWithoutPCode = jsonData.subdivisions.filter(s => !s.pcode);
  
  if (regionsWithoutPCode.length > 0) {
    console.log('\n⚠️  REGIONS WITHOUT P-CODES:');
    regionsWithoutPCode.forEach(region => {
      console.log(`  - "${region.nameFr}" (code: ${region.code})`);
    });
  }
  
  if (regionsWithoutEnglish.length > 0) {
    console.log('\n⚠️  REGIONS WITHOUT ENGLISH NAMES:');
    regionsWithoutEnglish.forEach(region => {
      console.log(`  - "${region.nameFr}" (code: ${region.code})`);
    });
  }
  
  if (divisionsWithoutPCode.length > 0) {
    console.log('\n⚠️  DIVISIONS WITHOUT P-CODES:');
    divisionsWithoutPCode.forEach(division => {
      console.log(`  - "${division.nameFr}" (code: ${division.code})`);
    });
  }
  
  if (subdivisionsWithoutPCode.length > 0) {
    console.log('\n⚠️  SUBDIVISIONS WITHOUT P-CODES:');
    subdivisionsWithoutPCode.forEach(subdivision => {
      console.log(`  - "${subdivision.nameFr}" (code: ${subdivision.code})`);
    });
  }
  
  if (regionsWithoutPCode.length === 0 && regionsWithoutEnglish.length === 0 && 
      divisionsWithoutPCode.length === 0 && subdivisionsWithoutPCode.length === 0) {
    console.log('\n🎉 ALL ENTITIES HAVE P-CODES AND REQUIRED NAMES!');
  }
  
  return jsonData;
}

// Main execution
async function main() {
  const jsonPath = './cameroon_locations_with_hasc.json';
  const regionPcodePath = './pcode-region.csv';
  const divisionPcodePath = './pcode-division.csv';
  const subdivisionPcodePath = './pcode-subdivision.csv';
  const outputPath = './cameroon_locations_complete.json';
  
  try {
    console.log('Loading JSON data...');
    const jsonFile = Bun.file(jsonPath);
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, `JSON file not found: ${jsonPath}`);
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log('Loading P-code data...');
    const regionPcodeEntries = await parsePCodeCSV(regionPcodePath);
    const divisionPcodeEntries = await parseDivisionPCodeCSV(divisionPcodePath);
    const subdivisionPcodeEntries = await parseSubdivisionPCodeCSV(subdivisionPcodePath);
    
    console.log('Adding P-codes and English names to JSON data...');
    const updatedData = await addPCodeAndEnglishToJSON(jsonData, regionPcodeEntries, divisionPcodeEntries, subdivisionPcodeEntries);
    
    console.log('Saving updated JSON...');
    await Bun.write(outputPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`\n✅ Updated JSON saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();