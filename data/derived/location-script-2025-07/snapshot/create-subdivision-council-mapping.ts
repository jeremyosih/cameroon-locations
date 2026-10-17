#!/usr/bin/env bun

/**
 * Script to create initial subdivision-council mapping
 * 1. Extract subdivision French names from cameroon_locations_complete.json
 * 2. Extract council names from geoBoundaries-CMR-ADM3.geojson
 * 3. Create initial mapping file subdivision-council-mapping.json
 */

interface Subdivision {
  nameFr: string;
  nameEn: string;
  code: string;
  divisionCode: string;
  population?: {
    total: number;
    male: number;
    female: number;
  };
  pcode?: string;
  area?: number;
}

interface LocationData {
  regions: any[];
  divisions: any[];
  subdivisions: Subdivision[];
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

interface CouncilMapping {
  [subdivisionName: string]: {
    councilNameFr: string;
    councilNameEn: string;
  };
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Creating subdivision-council mapping...\n');

    // 1. Read subdivision data
    console.log('📖 Reading subdivision data from cameroon_locations_complete.json...');
    const locationFile = await Bun.file('./cameroon_locations_complete.json').text();
    const locationData: LocationData = JSON.parse(locationFile);
    
    const subdivisions = locationData.subdivisions;
    console.log(`✅ Found ${subdivisions.length} subdivisions\n`);

    // 2. Read ADM3 GeoJSON data
    console.log('📖 Reading council data from geoBoundaries-CMR-ADM3.geojson...');
    const geoJsonFile = await Bun.file('./geoBoundaries-CMR-ADM3.geojson').text();
    const geoJsonData: GeoJSONData = JSON.parse(geoJsonFile);
    
    const adm3Features = geoJsonData.features.filter(f => f.properties.shapeType === 'ADM3');
    console.log(`✅ Found ${adm3Features.length} ADM3 council shapes\n`);

    // 3. Extract unique subdivision names
    const subdivisionNames = subdivisions.map(sub => sub.nameFr).sort();
    console.log('📋 Subdivision names extracted:');
    subdivisionNames.forEach((name, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. ${name}`);
    });
    console.log(`\n📊 Total subdivisions: ${subdivisionNames.length}\n`);

    // 4. Extract unique council shape names
    const councilNames = adm3Features
      .map(f => f.properties.shapeName)
      .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
      .sort();
    
    console.log('📋 Council shape names extracted:');
    councilNames.forEach((name, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. ${name}`);
    });
    console.log(`\n📊 Total councils: ${councilNames.length}\n`);

    // 5. Create initial mapping structure
    const mapping: CouncilMapping = {};
    
    subdivisionNames.forEach(subdivisionName => {
      mapping[subdivisionName] = {
        councilNameFr: '', // To be filled by matching or manual correction
        councilNameEn: ''  // To be filled by matching or manual correction
      };
    });

    // 6. Save the initial mapping
    const mappingJson = JSON.stringify(mapping, null, 2);
    await Bun.write('./subdivision-council-mapping.json', mappingJson);
    
    console.log('✅ Created subdivision-council-mapping.json with empty mappings');
    console.log(`📁 File contains ${Object.keys(mapping).length} subdivision entries\n`);

    // 7. Save council names for reference
    const councilNamesJson = JSON.stringify({ councilNames }, null, 2);
    await Bun.write('./council-names-reference.json', councilNamesJson);
    
    console.log('✅ Created council-names-reference.json for reference');
    console.log(`📁 File contains ${councilNames.length} council names\n`);

    // 8. Summary
    console.log('📊 SUMMARY:');
    console.log(`   • Subdivisions: ${subdivisionNames.length}`);
    console.log(`   • Councils: ${councilNames.length}`);
    console.log(`   • Expected 1:1 ratio: ${subdivisionNames.length === councilNames.length ? '✅ YES' : '❌ NO'}`);
    
    if (subdivisionNames.length !== councilNames.length) {
      console.log(`   • Difference: ${Math.abs(subdivisionNames.length - councilNames.length)}`);
      if (subdivisionNames.length > councilNames.length) {
        console.log('   • More subdivisions than councils - some councils may serve multiple subdivisions');
      } else {
        console.log('   • More councils than subdivisions - some subdivisions may be missing');
      }
    }

    console.log('\n🎯 Next step: Run test-council-matching.ts to test automatic matching');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}