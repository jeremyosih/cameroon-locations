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

// Generate English name for divisions and subdivisions
function generateEnglishName(frenchName: string): string {
  return frenchName
    .replace(/-ET-/g, '-AND-')
    .replace(/ ET /g, ' AND ')
    // Handle other common French to English translations
    .replace(/\bDE\b/g, 'OF')
    .replace(/\bDU\b/g, 'OF')
    .replace(/\bDES\b/g, 'OF')
    .replace(/\bLA\b/g, 'THE')
    .replace(/\bLE\b/g, 'THE')
    .replace(/\bLES\b/g, 'THE')
    // Handle specific geographic terms
    .replace(/\bNORD\b/g, 'NORTH')
    .replace(/\bSUD\b/g, 'SOUTH')
    .replace(/\bEST\b/g, 'EAST')
    .replace(/\bOUEST\b/g, 'WEST')
    .replace(/\bCENTRE\b/g, 'CENTER')
    .replace(/\bEXTREME\b/g, 'EXTREME')
    .replace(/\bHAUT\b/g, 'HIGH')
    .replace(/\bHAUTE\b/g, 'HIGH')
    .replace(/\bHAUTS\b/g, 'HIGH')
    .replace(/\bMONT\b/g, 'MOUNT')
    .replace(/\bVALLEE\b/g, 'VALLEY')
    .replace(/\bRIVIERE\b/g, 'RIVER')
    .replace(/\bLAC\b/g, 'LAKE')
    .replace(/\bOCEAN\b/g, 'OCEAN')
    .replace(/\bMARITIME\b/g, 'MARITIME')
    .replace(/\bLITTORAL\b/g, 'LITTORAL')
    .trim();
}

// Add English translations to the JSON data
async function addTranslationsToJSON(jsonData: ParsedData): Promise<ParsedData> {
  console.log('\n=== ADDING ENGLISH TRANSLATIONS ===');
  
  let divisionsTranslated = 0;
  let subdivisionsTranslated = 0;
  let cantonsTranslated = 0;
  let neighborhoodsTranslated = 0;
  let blocksTranslated = 0;
  
  // Regions already have English names from add-pcode-english.ts
  console.log(`Regions already have English names: ${jsonData.regions.length}`);
  
  // Add English names to divisions (replace -ET- with -AND-)
  for (const division of jsonData.divisions) {
    if (!division.nameEn || division.nameEn === '') {
      const translatedName = generateEnglishName(division.nameFr);
      division.nameEn = translatedName;
      divisionsTranslated++;
      
      // Only log if the name actually changed
      if (translatedName !== division.nameFr) {
        console.log(`✅ Division "${division.nameFr}" → "${translatedName}"`);
      }
    }
  }
  
  // Add English names to subdivisions (replace -ET- with -AND-)
  for (const subdivision of jsonData.subdivisions) {
    if (!subdivision.nameEn || subdivision.nameEn === '') {
      const translatedName = generateEnglishName(subdivision.nameFr);
      subdivision.nameEn = translatedName;
      subdivisionsTranslated++;
      
      // Only log if the name actually changed
      if (translatedName !== subdivision.nameFr) {
        console.log(`✅ Subdivision "${subdivision.nameFr}" → "${translatedName}"`);
      }
    }
  }
  
  // Add English names to cantons (copy French name) - no logging since no translation
  for (const canton of jsonData.cantons) {
    if (!canton.nameEn || canton.nameEn === '') {
      canton.nameEn = canton.nameFr;
      cantonsTranslated++;
    }
  }
  
  // Add English names to neighborhoods/villages (copy French name) - no logging since no translation
  for (const neighborhood of jsonData.neighborhoodsOrVillages) {
    if (!neighborhood.nameEn || neighborhood.nameEn === '') {
      neighborhood.nameEn = neighborhood.nameFr;
      neighborhoodsTranslated++;
    }
  }
  
  // Add English names to blocks (copy French name) - no logging since no translation
  for (const block of jsonData.blocks) {
    if (!block.nameEn || block.nameEn === '') {
      block.nameEn = block.nameFr;
      blocksTranslated++;
    }
  }
  
  // Summary
  console.log('\n=== TRANSLATION SUMMARY ===');
  console.log(`Regions with English names: ${jsonData.regions.length}/${jsonData.regions.length} (already completed)`);
  console.log(`Divisions processed: ${divisionsTranslated}/${jsonData.divisions.length}`);
  console.log(`Subdivisions processed: ${subdivisionsTranslated}/${jsonData.subdivisions.length}`);
  console.log(`Cantons processed: ${cantonsTranslated}/${jsonData.cantons.length}`);
  console.log(`Neighborhoods/Villages processed: ${neighborhoodsTranslated}/${jsonData.neighborhoodsOrVillages.length}`);
  console.log(`Blocks processed: ${blocksTranslated}/${jsonData.blocks.length}`);
  
  const totalTranslated = divisionsTranslated + subdivisionsTranslated + cantonsTranslated + neighborhoodsTranslated + blocksTranslated;
  const totalEntities = jsonData.divisions.length + jsonData.subdivisions.length + jsonData.cantons.length + jsonData.neighborhoodsOrVillages.length + jsonData.blocks.length;
  
  console.log('\n🎉 TRANSLATION COMPLETE!');
  console.log(`Total entities processed: ${totalEntities + jsonData.regions.length}`);
  console.log(`English names added where missing: ${totalTranslated}`);
  
  return jsonData;
}

// Main execution
async function main() {
  const jsonPath = './cameroon_locations_complete.json';
  const outputPath = './cameroon_locations_with_translations.json';
  
  try {
    console.log('Loading JSON data...');
    const jsonFile = Bun.file(jsonPath);
    const jsonExists = await jsonFile.exists();
    assert(jsonExists, `JSON file not found: ${jsonPath}`);
    
    const jsonContent = await jsonFile.text();
    const jsonData: ParsedData = JSON.parse(jsonContent);
    
    console.log('Adding English translations...');
    const updatedData = await addTranslationsToJSON(jsonData);
    
    console.log('Saving updated JSON...');
    await Bun.write(outputPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`\n✅ Updated JSON saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 