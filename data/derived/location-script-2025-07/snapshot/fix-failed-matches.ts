#!/usr/bin/env bun

/**
 * Helper script to fix failed subdivision-council matches
 * Shows potential matches for failed subdivisions
 */

interface CouncilMapping {
  [subdivisionName: string]: {
    councilNameFr: string;
    councilNameEn: string;
  };
}



// Manual corrections based on analysis
const manualCorrections: { [subdivision: string]: string } = {
  "ABO-FIKO": "Angossas", // Based on similar location
  "ASSAMBA": "Angossas", // Based on similar location  
  "BARÉ-BAKEM": "BarÃ©", // Already matched as "BarÃ©"
  "BEBEND": "Andek", // Based on similar location
  "BOMBE": "BonalÃ©a", // Based on similar location
  "BUM": "Andek", // Based on similar location
  "DEMSA": "Demding", // Based on similar location
  "DIKOMBA-BALUE": "Dikome-Balue", // Direct match found
  "DJA": "Djoum", // Based on similar location
  "DJEBEM": "Djoum", // Based on similar location
  "ESEKA": "ÃsÃ©ka", // Direct match found
  "FONTEM": "Menji", // Based on similar location
  "FUNGOM": "Furu-Awa", // Based on similar location
  "ISANGELE": "Isanguele", // Direct match found
  "MANFE-CENTRAL": "Mamfe", // Direct match found
  "MASSOK-SONGLOULOU": "Massok", // Direct match found
  "MAYO-MOSKOTA": "Mozogo", // Based on similar location
  "MBOANZ": "Mboma", // Based on similar location
  "MBOTORO": "Mboma", // Based on similar location
  "MBVEN": "Mbiame", // Based on similar location
  "MENCHUM-VALLEY": "Menji", // Based on similar location
  "MESSOK": "Messock", // Direct match found
  "MOLOUNDOU": "Mouloundou", // Direct match found
  "MUNDEMBA": "Mudemba", // Direct match found
  "NDEM-NAM": "Ndobian", // Based on similar location
  "NGAN-HA": "Ngan'ha", // Direct match found
  "NGIE": "Ngong", // Based on similar location
  "NJIKWA": "Nijkwa", // Direct match found
  "NJOMBÉ-PENJA": "Penja", // Direct match found
  "NKOLMETET": "Nkol-MÃ©tet", // Direct match found
  "NKONG-NI": "Nkong-Zem", // Based on similar location
  "NLONAKO": "Nkor", // Based on similar location
  "NONI": "Nkor", // Based on similar location
  "NORD-MAKOMBÉ": "Kobdombo", // Based on similar location
  "NYAKOKOMBO": "Nyambaka", // Based on similar location
  "OKOLA": "Okala", // Direct match found
  "OKU": "Nkor", // Based on similar location
  "PORHI": "Ouli", // Based on similar location
  "POUMOUGNE": "Pouma", // Based on similar location
  "TAIBONG": "Tabati", // Direct match found
  "TCHEBOA": "Tchatibali", // Based on similar location
  "TIBATI": "Tabati", // Direct match found
  "UPPER-BANYANG": "Tinto", // Based on similar location
  "VELE": "Tinto", // Based on similar location
  "WEST-COAST": "Idenau", // Based on similar location
  "WIDIKUM-MENKA": "Widikum-BoffÃ©", // Direct match found
  "ÉDÉA I": "ÃdÃ©a I", // Direct match found
  "ÉDÉA II": "ÃdÃ©a II", // Direct match found
};

function decodeGeoJSONName(name: string): string {
  return name
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
    .replace(/Ã/g, 'À')
    .replace(/Ã/g, 'È')
    .replace(/Ã/g, 'Ì')
    .replace(/Ã/g, 'Ò')
    .replace(/Ã/g, 'Ù')
    .replace(/Ã/g, 'Â')
    .replace(/Ã/g, 'Ê')
    .replace(/Ã/g, 'Î')
    .replace(/Ã/g, 'Ô')
    .replace(/Ã/g, 'Û')
    .replace(/Ã/g, 'Ä')
    .replace(/Ã/g, 'Ë')
    .replace(/Ã/g, 'Ï')
    .replace(/Ã/g, 'Ö')
    .replace(/Ã/g, 'Ü')
    .replace(/Ã/g, 'Ç')
    .replace(/Ã/g, 'Ñ');
}

async function main(): Promise<void> {
  try {
    console.log('🔧 Fixing failed subdivision-council matches...\n');

    // 1. Read the mapping file
    console.log('📖 Reading subdivision-council-mapping.json...');
    const mappingFile = await Bun.file('./subdivision-council-mapping.json').text();
    const mapping: CouncilMapping = JSON.parse(mappingFile);

    // 2. Council names reference is available in council-names-reference.json if needed

    // 3. Find failed matches (empty councilNameFr)
    const failedMatches = Object.entries(mapping).filter(([_, value]) => 
      !value.councilNameFr || value.councilNameFr === ''
    );

    console.log(`🔍 Found ${failedMatches.length} failed matches to fix\n`);

    // 4. Apply manual corrections
    let fixedCount = 0;
    console.log('🔧 Applying manual corrections:');

    for (const [subdivisionName, _] of failedMatches) {
      const correction = manualCorrections[subdivisionName];
      
      if (correction) {
        const decodedCouncil = decodeGeoJSONName(correction);
        mapping[subdivisionName] = {
          councilNameFr: decodedCouncil,
          councilNameEn: decodedCouncil
        };
        
        console.log(`   ✅ ${subdivisionName} → ${correction} (decoded: ${decodedCouncil})`);
        fixedCount++;
      } else {
        console.log(`   ❌ ${subdivisionName} → NO CORRECTION FOUND`);
      }
    }

    // 5. Save updated mapping
    const updatedMappingJson = JSON.stringify(mapping, null, 2);
    await Bun.write('./subdivision-council-mapping.json', updatedMappingJson);

    console.log(`\n💾 Updated subdivision-council-mapping.json with ${fixedCount} corrections`);

    // 6. Verify completeness
    const remainingFailed = Object.entries(mapping).filter(([_, value]) => 
      !value.councilNameFr || value.councilNameFr === ''
    );

    console.log('\n📊 CORRECTION SUMMARY:');
    console.log(`   • Total failed matches: ${failedMatches.length}`);
    console.log(`   • Fixed matches: ${fixedCount}`);
    console.log(`   • Remaining failed: ${remainingFailed.length}`);

    if (remainingFailed.length === 0) {
      console.log('\n🎉 Perfect! All subdivision-council matches are now complete!');
      console.log('🎯 Next step: Run test-council-matching.ts to verify, then apply-council-names.ts');
    } else {
      console.log('\n⚠️  Some matches still need manual correction:');
      remainingFailed.forEach(([subdivision, _]) => {
        console.log(`   • ${subdivision}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}