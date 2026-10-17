import assert from 'assert';

// Population data structure
interface PopulationData {
  total: number;
  male: number;
  female: number;
}

// Interfaces matching the current JSON structure
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

// Parse population data from extracted text file
interface PopulationEntry {
  name: string;
  level: 'country' | 'region' | 'division';
  population: PopulationData;
}

async function parsePopulationData(filePath: string): Promise<PopulationEntry[]> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `File not found: ${filePath}`);

  const content = await file.text();
  const lines = content.split('\n');
  
  const entries: PopulationEntry[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Parse line format: NAME total male female
    const match = trimmed.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)$/);
    if (!match) continue;
    
    const [_, name, totalStr, maleStr, femaleStr] = match;
    const total = parseInt(totalStr, 10);
    const male = parseInt(maleStr, 10);
    const female = parseInt(femaleStr, 10);
    
    if (isNaN(total) || isNaN(male) || isNaN(female)) continue;
    
    // Determine level based on indentation
    const indentation = line.length - line.trimStart().length;
    let level: 'country' | 'region' | 'division';
    
    if (indentation === 0) {
      level = 'country';
    } else if (indentation <= 4) {
      level = 'region';
    } else {
      level = 'division';
    }
    
    entries.push({
      name: name.trim(),
      level,
      population: { total, male, female }
    });
  }
  
  console.log(`Parsed ${entries.length} population entries`);
  return entries;
}

// Normalize names for matching
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
    .replace(/[\u2019''`′]/g, '') // Remove apostrophes
    .replace(/[""]/g, '') // Remove quotes
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Find population entry for a name
function findPopulationEntry(name: string, entries: PopulationEntry[], level: 'region' | 'division'): PopulationEntry | null {
  const normalizedName = normalizeNameForMatching(name);
  
  // Filter by level first
  const levelEntries = entries.filter(e => e.level === level);
  
  // Try exact match
  for (const entry of levelEntries) {
    const normalizedEntryName = normalizeNameForMatching(entry.name);
    if (normalizedEntryName === normalizedName) {
      return entry;
    }
  }
  
  // Try partial matches for common variations
  for (const entry of levelEntries) {
    const normalizedEntryName = normalizeNameForMatching(entry.name);
    
    // Handle common variations
    const nameWithVariations = normalizedName
      .replace(/FARO-ET-DEO/g, 'FARO-ET-DEO')
      .replace(/NYONG-ET-SOO/g, 'NYONG-ET-SO')
      .replace(/KUPE-ET-MANENGUBA/g, 'KUPE-ET-MANENGUBA')
      .replace(/EXTREME-NORD/g, 'EXTREME-NORD')
      .replace(/NORD-OUEST/g, 'NORD-OUEST')
      .replace(/SUD-OUEST/g, 'SUD-OUEST');
    
    const entryWithVariations = normalizedEntryName
      .replace(/FARO-ET-DEO/g, 'FARO-ET-DEO')
      .replace(/NYONG-ET-SO/g, 'NYONG-ET-SOO')
      .replace(/KUPE-ET-MANENGUBA/g, 'KUPE-ET-MANENGUBA')
      .replace(/EXTREME-NORD/g, 'EXTREME-NORD')
      .replace(/NORD-OUEST/g, 'NORD-OUEST')
      .replace(/SUD-OUEST/g, 'SUD-OUEST');
    
    if (nameWithVariations === entryWithVariations) {
      return entry;
    }
  }
  
  return null;
}

// Add population data to JSON
async function addPopulationToJSON(jsonData: ParsedData, populationEntries: PopulationEntry[]): Promise<ParsedData> {
  console.log('\n=== ADDING POPULATION DATA ===');
  
  let regionsWithPopulation = 0;
  let divisionsWithPopulation = 0;
  
  // Add population to regions
  for (const region of jsonData.regions) {
    const popEntry = findPopulationEntry(region.nameFr, populationEntries, 'region');
    
    if (popEntry) {
      region.population = popEntry.population;
      regionsWithPopulation++;
      console.log(`✅ Region "${region.nameFr}" → Population: ${popEntry.population.total.toLocaleString()}`);
    } else {
      console.log(`❌ Region "${region.nameFr}" → NO POPULATION FOUND`);
    }
  }
  
  // Add population to divisions
  for (const division of jsonData.divisions) {
    const popEntry = findPopulationEntry(division.nameFr, populationEntries, 'division');
    
    if (popEntry) {
      division.population = popEntry.population;
      divisionsWithPopulation++;
      console.log(`✅ Division "${division.nameFr}" → Population: ${popEntry.population.total.toLocaleString()}`);
    } else {
      console.log(`❌ Division "${division.nameFr}" → NO POPULATION FOUND`);
    }
  }
  
  // Summary
  console.log('\n=== POPULATION SUMMARY ===');
  console.log(`Regions with population: ${regionsWithPopulation}/${jsonData.regions.length}`);
  console.log(`Divisions with population: ${divisionsWithPopulation}/${jsonData.divisions.length}`);
  
  // Log missing population data
  const regionsWithoutPopulation = jsonData.regions.filter(r => r.population.total === -1);
  const divisionsWithoutPopulation = jsonData.divisions.filter(d => d.population.total === -1);
  
  if (regionsWithoutPopulation.length > 0) {
    console.log('\n⚠️  REGIONS WITHOUT POPULATION:');
    regionsWithoutPopulation.forEach(region => {
      console.log(`  - "${region.nameFr}" (code: ${region.code})`);
    });
  }
  
  if (divisionsWithoutPopulation.length > 0) {
    console.log('\n⚠️  DIVISIONS WITHOUT POPULATION:');
    divisionsWithoutPopulation.forEach(division => {
      console.log(`  - "${division.nameFr}" (code: ${division.code})`);
    });
  }
  
  if (regionsWithoutPopulation.length === 0 && divisionsWithoutPopulation.length === 0) {
    console.log('\n🎉 ALL REGIONS AND DIVISIONS HAVE POPULATION DATA!');
  }
  
  return jsonData;
}

// Main execution
async function main() {
  const jsonPath = './cameroon_locations.json';
  const populationPath = './extracted-pop.txt';
  const outputPath = './cameroon_locations_with_population.json';
  
  try {
    console.log('Loading JSON data...');
    const jsonFile = Bun.file(jsonPath);
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, `JSON file not found: ${jsonPath}`);
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log('Loading population data...');
    const populationEntries = await parsePopulationData(populationPath);
    
    console.log('Adding population data to JSON...');
    const updatedData = await addPopulationToJSON(jsonData, populationEntries);
    
    console.log('Saving updated JSON...');
    await Bun.write(outputPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`\n✅ Updated JSON saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 