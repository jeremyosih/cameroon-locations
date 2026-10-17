#!/usr/bin/env bun

/**
 * Script to apply council names to cameroon_locations_complete.json
 * Adds councilNameFr and councilNameEn fields to subdivision objects
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
  councilNameFr?: string;
  councilNameEn?: string;
}

interface LocationData {
  regions: any[];
  divisions: any[];
  subdivisions: Subdivision[];
}

interface CouncilMapping {
  [subdivisionName: string]: {
    councilNameFr: string;
    councilNameEn: string;
  };
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Applying council names to cameroon_locations_complete.json...\n');

    // 1. Read the mapping file
    console.log('📖 Reading subdivision-council-mapping.json...');
    const mappingFile = await Bun.file('./subdivision-council-mapping.json').text();
    const mapping: CouncilMapping = JSON.parse(mappingFile);
    
    console.log(`✅ Loaded mapping for ${Object.keys(mapping).length} subdivisions\n`);

    // 2. Validate mapping completeness
    console.log('🔍 Validating mapping completeness...');
    const emptyMappings = Object.entries(mapping).filter(([_, value]) => 
      !value.councilNameFr || !value.councilNameEn
    );
    
    if (emptyMappings.length > 0) {
      console.log(`❌ Found ${emptyMappings.length} incomplete mappings:`);
      emptyMappings.forEach(([subdivision, _]) => {
        console.log(`   • ${subdivision}`);
      });
      console.log('\n🔧 Please complete the mapping in subdivision-council-mapping.json before proceeding.');
      process.exit(1);
    }
    
    console.log('✅ All mappings are complete\n');

    // 3. Read the main location data
    console.log('📖 Reading cameroon_locations_complete.json...');
    const locationFile = await Bun.file('./cameroon_locations_complete.json').text();
    const locationData: LocationData = JSON.parse(locationFile);
    
    console.log(`✅ Loaded data with ${locationData.subdivisions.length} subdivisions\n`);

    // 4. Apply council names
    console.log('🔄 Applying council names...');
    let appliedCount = 0;
    let notFoundCount = 0;
    const notFoundSubdivisions: string[] = [];

    for (const subdivision of locationData.subdivisions) {
      const councilInfo = mapping[subdivision.nameFr];
      
      if (councilInfo && councilInfo.councilNameFr && councilInfo.councilNameEn) {
        subdivision.councilNameFr = councilInfo.councilNameFr;
        subdivision.councilNameEn = councilInfo.councilNameEn;
        appliedCount++;
      } else {
        notFoundSubdivisions.push(subdivision.nameFr);
        notFoundCount++;
      }
    }

    console.log(`✅ Applied council names to ${appliedCount} subdivisions`);
    
    if (notFoundCount > 0) {
      console.log(`❌ Could not find mapping for ${notFoundCount} subdivisions:`);
      notFoundSubdivisions.forEach(name => {
        console.log(`   • ${name}`);
      });
      console.log('\n🔧 Please add these subdivisions to the mapping file.');
      process.exit(1);
    }

    // 5. Create backup
    console.log('\n💾 Creating backup of original file...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `cameroon_locations_complete_backup_${timestamp}.json`;
    
    await Bun.write(`./${backupFilename}`, locationFile);
    console.log(`✅ Backup saved as ${backupFilename}`);

    // 6. Save updated data
    console.log('\n💾 Saving updated cameroon_locations_complete.json...');
    const updatedJson = JSON.stringify(locationData, null, 2);
    await Bun.write('./cameroon_locations_complete.json', updatedJson);
    
    console.log('✅ Successfully updated cameroon_locations_complete.json');

    // 7. Verification
    console.log('\n🔍 Verifying updates...');
    const verificationFile = await Bun.file('./cameroon_locations_complete.json').text();
    const verificationData: LocationData = JSON.parse(verificationFile);
    
    const subdivisionsWithCouncils = verificationData.subdivisions.filter(sub => 
      sub.councilNameFr && sub.councilNameEn
    );
    
    console.log(`✅ Verification: ${subdivisionsWithCouncils.length}/${verificationData.subdivisions.length} subdivisions have council names`);

    // 8. Sample output
    console.log('\n📋 Sample of updated subdivisions:');
    const sampleSubdivisions = verificationData.subdivisions.slice(0, 5);
    sampleSubdivisions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.nameFr} → Council: ${sub.councilNameFr} (${sub.councilNameEn})`);
    });

    // 9. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   • Total subdivisions: ${verificationData.subdivisions.length}`);
    console.log(`   • Subdivisions with council names: ${subdivisionsWithCouncils.length}`);
    console.log(`   • Success rate: ${((subdivisionsWithCouncils.length / verificationData.subdivisions.length) * 100).toFixed(1)}%`);
    console.log(`   • Backup created: ${backupFilename}`);
    
    if (subdivisionsWithCouncils.length === verificationData.subdivisions.length) {
      console.log('\n🎉 Perfect! All subdivisions now have council names!');
      console.log('✅ The migration is complete.');
    } else {
      console.log('\n⚠️  Some subdivisions are missing council names.');
      console.log('🔧 Please check the mapping file and re-run the script.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}