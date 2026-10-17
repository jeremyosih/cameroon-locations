import assert from 'assert';

interface ElecamRecord {
  regionName: string;
  divisionName: string;
  councilName: string;
  centerName: string;
  stationName: string;
  total: number;
}

interface PollingStation {
  stationName: string;
  voterCount: number;
}

interface PollingCenter {
  centerName: string;
  totalVoters: number;
  stations: PollingStation[];
}

interface CouncilElecamData {
  subdivisionCode: string;
  councilName: string;
  totalVoters: number;
  totalCenters: number;
  totalStations: number;
  votersPerStation: number;
  pollingCenters: PollingCenter[];
}

interface Subdivision {
  nameFr: string;
  nameEn: string;
  code: string;
  divisionCode: string;
  population: any;
  pcode?: string;
  area?: number;
  councilNameFr?: string;
  councilNameEn?: string;
}

interface ParsedData {
  regions: any[];
  divisions: any[];
  subdivisions: Subdivision[];
  cantons: any[];
  neighborhoodsOrVillages: any[];
  blocks: any[];
}

// Normalize names for matching
function normalizeNameForMatching(name: string): string {
  return name
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
    // Normalize spaces and dashes
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Find subdivision by council name
function findSubdivisionByCouncilName(elecamCouncilName: string, subdivisions: Subdivision[]): Subdivision | null {
  const normalizedElecamName = normalizeNameForMatching(elecamCouncilName);
  
  // Manual mappings for specific ELECAM council names that don't match automatically
  const manualMappings: Record<string, string> = {
    'EYUMOJOCK': 'EYUMODJOCK',           // ELECAM: EYUMOJOCK → Subdivision: EYUMODJOCK
    'GUEME-VELE': 'VELE',               // ELECAM: GUEME-VELE → Subdivision: VELE  
    'MAKARI': 'MAKARI',                 // ELECAM: MAKARI → Subdivision: MAKARI
    'MALANTOUEN': 'MALENTOUEN',         // ELECAM: MALANTOUEN → Subdivision: MALENTOUEN
    'MASSOK-SONGLOULOU': 'MASSOK-SONGLOULOU',  // ELECAM: MASSOK-SONGLOULOU → Subdivision: MASSOK-SONGLOULOU
    'MESSOK': 'MESSOK',                 // ELECAM: MESSOK → Subdivision: MESSOK
    'NJOMBE-PENJA': 'NJOMBÉ-PENJA',     // ELECAM: NJOMBE-PENJA → Subdivision: NJOMBÉ-PENJA
    'NKONG-NI': 'NKONG-NI',             // ELECAM: NKONG-NI → Subdivision: NKONG-NI
    'GASCHIGA': 'DEMSA'                 // ELECAM: GASCHIGA → Subdivision: DEMSA (you fixed this)
  };
  
  // Check manual mappings first
  if (manualMappings[elecamCouncilName]) {
    const mappedName = manualMappings[elecamCouncilName];
    for (const subdivision of subdivisions) {
      if (subdivision.nameFr === mappedName) {
        console.log(`🔧 Manual mapping: "${elecamCouncilName}" → "${mappedName}" (subdivision: ${subdivision.nameFr})`);
        return subdivision;
      }
    }
  }
  
  // Try exact match with council names
  for (const subdivision of subdivisions) {
    if (subdivision.councilNameFr) {
      const normalizedCouncilName = normalizeNameForMatching(subdivision.councilNameFr);
      if (normalizedCouncilName === normalizedElecamName) {
        return subdivision;
      }
    }
  }
  
  // Try partial matches for common variations
  for (const subdivision of subdivisions) {
    if (subdivision.councilNameFr) {
      const normalizedCouncilName = normalizeNameForMatching(subdivision.councilNameFr);
      
      // Handle common variations
      const elecamWithVariations = normalizedElecamName
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
      
      if (elecamWithVariations === councilWithVariations ||
          normalizedElecamName.replace(/[-\s]/g, '') === normalizedCouncilName.replace(/[-\s]/g, '')) {
        return subdivision;
      }
    }
  }
  
  return null;
}

// Process ELECAM data
async function processElecamData(): Promise<void> {
  console.log('🗳️  Processing ELECAM polling station data...\n');

  // Read subdivision data
  const subdivisionFile = Bun.file('./cameroon_locations_complete.json');
  const subdivisionExists = await subdivisionFile.exists();
  assert(subdivisionExists, 'Subdivision data file not found: ./cameroon_locations_complete.json');
  
  const subdivisionContent = await subdivisionFile.text();
  const subdivisionData: ParsedData = JSON.parse(subdivisionContent);
  
  console.log(`📊 Loaded ${subdivisionData.subdivisions.length} subdivisions with council names`);

  // Read ELECAM CSV data
  const elecamFile = Bun.file('./elecam_data.csv');
  const elecamExists = await elecamFile.exists();
  assert(elecamExists, 'ELECAM data file not found: ./elecam_data.csv');
  
  const elecamContent = await elecamFile.text();
  const lines = elecamContent.split('\n').filter(line => line.trim());
  
  console.log(`📊 Loaded ${lines.length - 1} ELECAM records (excluding header)`);

  // Parse ELECAM data
  const elecamRecords: ElecamRecord[] = [];
  const header = lines[0];
  console.log(`📋 CSV Header: ${header}`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length !== 6) {
      console.warn(`⚠️  Skipping malformed line ${i + 1}: ${line}`);
      continue;
    }

    const [regionName, divisionName, councilName, centerName, stationName, totalStr] = fields;
    const total = parseInt(totalStr);

    if (isNaN(total)) {
      console.warn(`⚠️  Invalid total on line ${i + 1}: ${totalStr}`);
      continue;
    }

    elecamRecords.push({
      regionName: regionName.trim(),
      divisionName: divisionName.trim(),
      councilName: councilName.trim(),
      centerName: centerName.trim(),
      stationName: stationName.trim(),
      total
    });
  }

  console.log(`✅ Parsed ${elecamRecords.length} valid ELECAM records`);

  // Group by council name and match to subdivisions
  const councilGroups = new Map<string, ElecamRecord[]>();
  const unmatchedCouncils = new Set<string>();
  const matchedCouncils = new Map<string, { subdivision: Subdivision; records: ElecamRecord[] }>();

  // Group records by council name
  for (const record of elecamRecords) {
    if (!councilGroups.has(record.councilName)) {
      councilGroups.set(record.councilName, []);
    }
    councilGroups.get(record.councilName)!.push(record);
  }

  console.log(`\n🔍 Found ${councilGroups.size} unique councils in ELECAM data`);

  // Match councils to subdivisions
  for (const [councilName, records] of councilGroups) {
    const subdivision = findSubdivisionByCouncilName(councilName, subdivisionData.subdivisions);
    
    if (subdivision) {
      matchedCouncils.set(councilName, { subdivision, records });
      console.log(`✅ "${councilName}" → matched subdivision "${subdivision.nameFr}" (ID: ${subdivision.code}, council: ${subdivision.councilNameFr})`);
    } else {
      unmatchedCouncils.add(councilName);
      console.log(`❌ "${councilName}" → NO MATCH FOUND`);
    }
  }

  console.log(`\n📊 Matching Summary:`);
  console.log(`   • Total councils: ${councilGroups.size}`);
  console.log(`   • Matched: ${matchedCouncils.size} (${((matchedCouncils.size / councilGroups.size) * 100).toFixed(1)}%)`);
  console.log(`   • Unmatched: ${unmatchedCouncils.size} (${((unmatchedCouncils.size / councilGroups.size) * 100).toFixed(1)}%)`);

  // Process matched councils and generate output
  const councilElecamData: CouncilElecamData[] = [];

  for (const [elecamCouncilName, { subdivision, records }] of matchedCouncils) {
    // Group by polling center
    const centerGroups = new Map<string, ElecamRecord[]>();
    
    for (const record of records) {
      if (!centerGroups.has(record.centerName)) {
        centerGroups.set(record.centerName, []);
      }
      centerGroups.get(record.centerName)!.push(record);
    }

    // Build polling centers data
    const pollingCenters: PollingCenter[] = [];
    let totalCouncilVoters = 0;

    for (const [centerName, centerRecords] of centerGroups) {
      const stations: PollingStation[] = [];
      let totalCenterVoters = 0;

      for (const record of centerRecords) {
        stations.push({
          stationName: record.stationName,
          voterCount: record.total
        });
        totalCenterVoters += record.total;
      }

      // Sort stations by name
      stations.sort((a, b) => a.stationName.localeCompare(b.stationName));

      pollingCenters.push({
        centerName,
        totalVoters: totalCenterVoters,
        stations
      });

      totalCouncilVoters += totalCenterVoters;
    }

    // Sort centers by name
    pollingCenters.sort((a, b) => a.centerName.localeCompare(b.centerName));

    const totalStations = pollingCenters.reduce((sum, center) => sum + center.stations.length, 0);
    const votersPerStation = totalStations > 0 ? Math.round(totalCouncilVoters / totalStations) : 0;

    councilElecamData.push({
      subdivisionCode: subdivision.code,
      councilName: subdivision.councilNameFr || subdivision.nameFr,
      totalVoters: totalCouncilVoters,
      totalCenters: pollingCenters.length,
      totalStations,
      votersPerStation,
      pollingCenters
    });

    console.log(`📊 Processed "${elecamCouncilName}": ${pollingCenters.length} centers, ${totalCouncilVoters.toLocaleString()} total voters`);
  }

  // Sort by subdivision code
  councilElecamData.sort((a, b) => parseInt(a.subdivisionCode) - parseInt(b.subdivisionCode));

  // Calculate totals for metadata
  const totalVoters = councilElecamData.reduce((sum, council) => sum + council.totalVoters, 0);
  const totalCenters = councilElecamData.reduce((sum, council) => sum + council.totalCenters, 0);
  const totalStations = councilElecamData.reduce((sum, council) => sum + council.totalStations, 0);
  const coverage = ((matchedCouncils.size / councilGroups.size) * 100).toFixed(1);

  // Create output with metadata
  const outputData = {
    metadata: {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      totalCouncils: councilElecamData.length,
      totalCenters,
      totalStations,
      totalVoters,
      coverage: `${coverage}%`,
      source: "ELECAM Cameroon Electoral Data"
    },
    councils: councilElecamData
  };

  // Save main output
  const outputPath = './elecam_polling_stations.json';
  await Bun.write(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n✅ Saved ELECAM polling station data to: ${outputPath}`);

  // Save unmatched councils report
  const unmatchedArray = Array.from(unmatchedCouncils).sort();
  const unmatchedReport = {
    totalUnmatched: unmatchedArray.length,
    unmatchedCouncils: unmatchedArray.map(name => ({
      elecamCouncilName: name,
      recordCount: councilGroups.get(name)?.length || 0
    }))
  };

  const reportPath = './elecam_unmatched_councils.json';
  await Bun.write(reportPath, JSON.stringify(unmatchedReport, null, 2));
  console.log(`📋 Saved unmatched councils report to: ${reportPath}`);

  // Final summary
  console.log(`\n🎉 ELECAM Data Processing Complete!`);
  console.log(`📊 Final Statistics:`);
  console.log(`   • Councils processed: ${councilElecamData.length}`);
  console.log(`   • Polling centers: ${totalCenters.toLocaleString()}`);
  console.log(`   • Polling stations: ${totalStations.toLocaleString()}`);
  console.log(`   • Total registered voters: ${totalVoters.toLocaleString()}`);
  console.log(`   • Coverage: ${coverage}%`);
  console.log(`   • Unmatched councils: ${unmatchedArray.length} (see ${reportPath})`);
}

// Main function
async function main(): Promise<void> {
  try {
    await processElecamData();
  } catch (error) {
    console.error('❌ Error processing ELECAM data:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}