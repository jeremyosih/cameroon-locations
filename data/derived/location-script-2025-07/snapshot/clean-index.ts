import assert from 'assert';

// Population data structure
interface PopulationData {
  total: number;
  male: number;
  female: number;
}

// Define the 6-level hierarchy interfaces
interface Region {
  nameFr: string;
  nameEn: string;
  code: string;
  population: PopulationData;
}

interface Division {
  nameFr: string;
  nameEn: string;
  code: string;
  regionCode: string;
  population: PopulationData;
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

// Utility functions
function generateCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

function formatNameWithDashes(name: string): string {
  let formatted = name.trim();
  
  // First, normalize all types of apostrophes to a standard one
  // Including U+2019 (RIGHT SINGLE QUOTATION MARK)
  formatted = formatted
    .replace(/[\u2019''`′]/g, "'") // Replace various apostrophes including U+2019
    .replace(/[""]/g, '"'); // Replace curly quotes with standard quotes
  
  // Handle specific subdivision name conversions
  if (formatted.toUpperCase() === "MANFE-CENTRAL" || formatted.toUpperCase() === "MANFE CENTRAL") {
    formatted = "MAMFE";
  }
  
  // Handle specific prepositions at the start - check longest patterns first
  if (formatted.toUpperCase().startsWith("DE L'")) {
    formatted = formatted.substring(5);
  } else if (formatted.toUpperCase().startsWith("DE LA ")) {
    formatted = formatted.substring(6);
  } else if (formatted.toUpperCase().startsWith("L'")) {
    formatted = formatted.substring(2);
  } else if (formatted.toUpperCase().startsWith("LA ")) {
    formatted = formatted.substring(3);
  } else if (formatted.toUpperCase().startsWith("DE ")) {
    formatted = formatted.substring(3);
  } else if (formatted.toUpperCase().startsWith("DU ")) {
    formatted = formatted.substring(3);
  } else if (formatted.toUpperCase().startsWith("DES ")) {
    formatted = formatted.substring(4);
  } else if (formatted.toUpperCase().startsWith("D'")) {
    formatted = formatted.substring(2);
  }
  
  // Remove any remaining quotes
  formatted = formatted.replace(/['"]/g, '');
  
  // Apply dash formatting: spaces→dashes except between numbers and names
  // Split by spaces and process each transition
  const words = formatted.split(/\s+/).filter(word => word.length > 0);
  if (words.length <= 1) {
    return formatted.trim();
  }
  
  const result = [words[0]];
  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1];
    const currentWord = words[i];
    
    // Check if current word is a Roman numeral (I, II, III, IV, V, VI, VII, VIII, IX, X, etc.)
    const currentIsRomanNumeral = /^[IVXLCDM]+$/.test(currentWord);
    
    // Check if current or previous word is "OU" (conjunction meaning "OR")
    const currentIsOU = currentWord.toUpperCase() === 'OU';
    const prevIsOU = prevWord.toUpperCase() === 'OU';
    
    // Check if previous word ends with a number and current word starts with a letter
    const prevEndsWithNumber = /\d$/.test(prevWord);
    const currentStartsWithLetter = /^[A-Za-z]/.test(currentWord);
    
    if ((prevEndsWithNumber && currentStartsWithLetter) || currentIsRomanNumeral || currentIsOU || prevIsOU) {
      // Don't add dash in these cases:
      // - Between number and name (e.g., "Douala I")
      // - Before Roman numerals (e.g., "AKOM II")
      // - Around "OU" conjunction (e.g., "NAME1 OU NAME2")
      result.push(' ' + currentWord);
    } else {
      // Add dash between other words (e.g., "Centre Sud" → "Centre-Sud")
      result.push('-' + currentWord);
    }
  }
  
  return result.join('').trim();
}

function cleanLocationName(name: string): string {
  return formatNameWithDashes(name);
}

function classifyCanton(name: string): Canton['type'] {
  const upperName = name.toUpperCase();
  
  // Check for ville/town/city
  if (upperName.includes('VILLE') || upperName.includes('TOWN') || upperName.includes('CITY')) {
    return 'city';
  } 
  // Check for rural
  else if (upperName.includes('RURAL')) {
    return 'rural';
  } 
  // Check for lamidat
  else if (upperName.includes('LAMIDAT')) {
    return 'lamidat';
  } 
  // Check for groupement
  else if (upperName.includes('GROUPEMENT') || upperName.includes('GROUP')) {
    return 'group';
  } 
  // Check for sultanat
  else if (upperName.includes('SULTANAT') || upperName.includes('SULTANATE')) {
    return 'sultanate';
  } 
  // Check for secteur
  else if (upperName.includes('SECTEUR') || upperName.includes('SECTOR')) {
    return 'sector';
  } 
  // Check for chefferie/chiefdom
  else if (upperName.includes('CHEFFERIE') || upperName.includes('CHIEFDOM') || upperName.includes('CHIEF')) {
    return 'chiefdom';
  } 
  // Default to canton/district
  else {
    return 'canton';
  }
}

function classifyNeighborhoodOrVillage(name: string, indentation: number): NeighborhoodOrVillage['type'] {
  const upperName = name.toUpperCase();
  
  // Check for quartier/neighborhood
  if (upperName.includes('QUARTIER') || upperName.includes('NEIGHBORHOOD') || upperName.includes('DISTRICT') || indentation >= 20) {
    return 'neighborhood';
  } 
  // Check for village
  else if (upperName.includes('VILLAGE')) {
    return 'village';
  } 
  // Default to localite/locality
  else {
    return 'locality';
  }
}

async function parseLocations(filePath: string): Promise<ParsedData> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  assert(exists, `File not found: ${filePath}`);

  const content = await file.text();
  console.log(`File content length: ${content.length} characters`);
  
  const lines = content.split('\n');
  console.log(`Processing ${lines.length} lines`);

  const result: ParsedData = {
    regions: [],
    divisions: [],
    subdivisions: [],
    cantons: [],
    neighborhoodsOrVillages: [],
    blocks: []
  };

  let currentRegion: Region | null = null;
  let currentDivision: Division | null = null;
  let currentSubdivision: Subdivision | null = null;
  let currentCanton: Canton | null = null;

  // Order counters
  let regionOrder = 0;
  let divisionOrder = 0;
  let subdivisionOrder = 0;
  let cantonOrder = 0;
  let neighborhoodOrder = 0;
  let blockOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const line = originalLine.trim();

    if (!line) continue;

    // Skip page numbers
    if (/^\s*Page\s+\d+\s*$/.test(line)) {
      continue;
    }

    // Match region
    const regionMatch = line.match(/^\s*(\d+)\.\s*R[EÉ]GION\s+(.+)$/i);
    if (regionMatch) {
      const [_, num, fullName] = regionMatch;
      const cleanName = cleanLocationName(fullName.trim());
      
      regionOrder++;
      currentRegion = {
        nameFr: cleanName,
        nameEn: '',
        code: regionOrder.toString(),
        population: { total: -1, male: -1, female: -1 }
      };
      result.regions.push(currentRegion);
      console.log(`Found Region: ${currentRegion.nameFr} (code: ${currentRegion.code})`);
      continue;
    }

    // Match division
    const divisionMatch = line.match(/^\s*(\d+\.\d+)\.?\s*D[EÉ]PARTEMENTS?\s+(.+)$/i);
    if (divisionMatch && currentRegion) {
      const [_, num, fullName] = divisionMatch;
      const cleanName = cleanLocationName(fullName.trim());
      
      divisionOrder++;
      currentDivision = {
        nameFr: cleanName,
        nameEn: '',
        code: divisionOrder.toString(),
        regionCode: currentRegion.code,
        population: { total: -1, male: -1, female: -1 }
      };
      result.divisions.push(currentDivision);
      console.log(`Found Division: ${currentDivision.nameFr} (code: ${currentDivision.code})`);
      continue;
    }

    // Match subdivision
    const subdivisionMatch = line.match(/^\s*(\d+\.\d+\.\d+)\.?\s*(ARRONDISS?E?MENTS?)\s*(DE|DU|D[E']|DE LA)?\s*(.+)$/i);
    if (subdivisionMatch && currentDivision) {
      const [_, num, arrondissement, preposition, name] = subdivisionMatch;
      
      let cleanName = name;
      if (!preposition && cleanName.startsWith('DE ')) {
        cleanName = cleanName.substring(3);
      }
      
      const fullName = preposition ? `${preposition} ${cleanName}`.trim() : cleanName.trim();
      const finalName = cleanLocationName(fullName);
      
      subdivisionOrder++;
      currentSubdivision = {
        nameFr: finalName,
        nameEn: '',
        code: subdivisionOrder.toString(),
        divisionCode: currentDivision.code,
        population: { total: -1, male: -1, female: -1 }
      };
      result.subdivisions.push(currentSubdivision);
      console.log(`Found Subdivision: ${currentSubdivision.nameFr} (code: ${currentSubdivision.code})`);
      
      // The next line should be the subdivision total - extract population
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const popMatch = nextLine.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)$/);
        if (popMatch) {
          const [_, popName, total, male, female] = popMatch;
          if (cleanLocationName(popName) === finalName) {
            currentSubdivision.population = {
              total: parseInt(total, 10),
              male: parseInt(male, 10),
              female: parseInt(female, 10)
            };
            console.log(`  Population: ${currentSubdivision.population.total.toLocaleString()}`);
            i++; // Skip the population line
          }
        }
      }
      continue;
    }

    // Match population data for units and quartier/villages
    const dataMatch = line.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)$/);
    if (dataMatch && currentSubdivision) {
      const [_, rawName, totalStr, maleStr, femaleStr] = dataMatch;
      const name = cleanLocationName(rawName);
      
      // Skip header-like rows
      if (name.includes('Quartiers') || name.includes('Sexe') || 
          name.includes('Masculin') || name.includes('Féminin') || 
          name === 'Total') {
        continue;
      }

      const total = parseInt(totalStr, 10);
      const male = parseInt(maleStr, 10);
      const female = parseInt(femaleStr, 10);

      if (isNaN(total) || isNaN(male) || isNaN(female)) {
        console.log(`Warning: Invalid numbers in row: ${line}`);
        continue;
      }

      const indentation = originalLine.length - originalLine.trimStart().length;
      
      // Skip subdivision totals (already handled above)
      if (indentation <= 12) {
        continue;
      }

      // Determine hierarchy level based on indentation
      if (indentation <= 16) {
        // This is a Canton (ville, rural, etc.)
        const type = classifyCanton(name);
        
        cantonOrder++;
        currentCanton = {
          nameFr: name,
          nameEn: '',
          code: cantonOrder.toString(),
          type,
          subdivisionCode: currentSubdivision.code,
          population: { total, male, female }
        };
        result.cantons.push(currentCanton);
        console.log(`  Found Canton: ${name} (${type})`);
        
      } else if (indentation <= 20) {
        // This is a NeighborhoodOrVillage
        if (currentCanton) {
          const type = classifyNeighborhoodOrVillage(name, indentation);
          
          neighborhoodOrder++;
          const neighborhoodOrVillage: NeighborhoodOrVillage = {
            nameFr: name,
            nameEn: '',
            code: neighborhoodOrder.toString(),
            type,
            cantonCode: currentCanton.code,
            population: { total, male, female }
          };
          result.neighborhoodsOrVillages.push(neighborhoodOrVillage);
          console.log(`    Found ${type}: ${name}`);
        }
        
      } else {
        // This might be a Block (very rare)
        const lastNeighborhoodOrVillage = result.neighborhoodsOrVillages[result.neighborhoodsOrVillages.length - 1];
        if (lastNeighborhoodOrVillage) {
          blockOrder++;
          const block: Block = {
            nameFr: name,
            nameEn: '',
            code: blockOrder.toString(),
            neighborhoodOrVillageCode: lastNeighborhoodOrVillage.code
          };
          result.blocks.push(block);
          console.log(`      Found Block: ${name}`);
        }
      }
    }
  }

  console.log(`Finished parsing.`);
  return result;
}

function validateHierarchy(data: ParsedData): void {
  console.log('\n=== LOCATION COUNTS ===');
  console.log(`REGIONS: ${data.regions.length}`);
  console.log(`DIVISIONS: ${data.divisions.length}`);
  console.log(`SUBDIVISIONS: ${data.subdivisions.length}`);
  console.log(`CANTONS: ${data.cantons.length}`);
  console.log(`NEIGHBORHOODS/VILLAGES: ${data.neighborhoodsOrVillages.length}`);
  console.log(`BLOCKS: ${data.blocks.length}`);

  // Calculate total population from leaf nodes (neighborhoods/villages)
  const totalPopulation = data.neighborhoodsOrVillages.reduce((sum, nv) => sum + (nv.population?.total || 0), 0);
  
  console.log('\n=== POPULATION VALIDATION ===');
  console.log(`Total Population: ${totalPopulation.toLocaleString()}`);

  // Validation checks
  console.log('\n=== VALIDATION CHECKS ===');
  
  const expectedPopulation = 17463836;
  const populationDiff = Math.abs(totalPopulation - expectedPopulation);
  const populationPercent = (populationDiff / expectedPopulation) * 100;

  if (populationPercent <= 5) {
    console.log(`✅ Population: ${totalPopulation.toLocaleString()} (Expected: ${expectedPopulation.toLocaleString()}, Diff: ${populationPercent.toFixed(2)}%)`);
  } else {
    console.log(`⚠️ Population: ${totalPopulation.toLocaleString()} (Expected: ${expectedPopulation.toLocaleString()}, Diff: ${populationPercent.toFixed(2)}%)`);
  }

  // Canton type breakdown
  console.log('\n=== CANTON TYPE BREAKDOWN ===');
  const cantonTypes = data.cantons.reduce((acc, canton) => {
    acc[canton.type] = (acc[canton.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(cantonTypes).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
}

// Main execution
async function main() {
  const inputPath = process.argv[2] || './locv2_cleaned.txt';
  console.log(`Processing file: ${inputPath}`);

  try {
    const data = await parseLocations(inputPath);
    validateHierarchy(data);
    
    // Save to JSON
    const outputPath = './cameroon_locations.json';
    await Bun.write(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nData saved to: ${outputPath}`);
    
    console.log('\nValidation complete.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 