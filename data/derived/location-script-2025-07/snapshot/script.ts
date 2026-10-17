// location-parser.ts

// 1. Type Definitions
interface Location {
  locationId: number;
  englishName: string;
  name: string;
  geojson: Record<string, any>;
  createdBy: { source: string };
  position: number;
  capital: boolean;
  code: string;
  city: boolean;
  locationType: LocationType;
  parentLocationId: number | null;
  population: number;
}

enum LocationType {
  REGION = 'REGION',
  DIVISION = 'DIVISION',
  DISTRICT = 'DISTRICT',
  VILLAGE_OR_NEIGHBORHOOD = 'VILLAGE_OR_NEIGHBORHOOD',
  LOCALITY_OR_BLOCK = 'LOCALITY_OR_BLOCK'
}

// 2. Core Parser Class
class LocationParser {
  private locations = new Map<string, Location>();
  private counters = {
    [LocationType.REGION]: 0,
    [LocationType.DIVISION]: 0,
    [LocationType.DISTRICT]: 0,
    [LocationType.VILLAGE_OR_NEIGHBORHOOD]: 0,
    [LocationType.LOCALITY_OR_BLOCK]: 0
  };

  private currentContext = {
    region: null as Location | null,
    division: null as Location | null,
    district: null as Location | null,
    village: null as Location | null
  };

  // 3. Population Line Parser
  private parsePopulationLine(line: string) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) return null;

    const lastThree = parts.slice(-3).map(Number);
    if (lastThree.some(isNaN)) return null;

    return {
      name: parts.slice(0, -3).join(' '),
      total: lastThree[0],
      male: lastThree[1],
      female: lastThree[2]
    };
  }

  // 4. Line Type Detection
  private isRegionHeader(line: string): boolean {
    return /^\s*(\d+)\s*\.\s*R[EÉ]GION/i.test(line);
  }

  private isDivisionHeader(line: string): boolean {
    return /^\s*(\d+\s*\.\s*\d+)\s*\.\s*D[EÉ]PARTEMENT/i.test(line);
  }

  private isDistrictHeader(line: string): boolean {
    return /^\s*(\d+\s*\.\s*\d+\s*\.\s*\d+)\s*\.\s*ARRONDISSEMENT(?:DE)?/i.test(line);
  }

  // 5. Main Parse Method
  async parse(content: string) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.includes('BUCREP')) continue;

      if (this.isRegionHeader(line)) {
        await this.handleRegionHeader(line);
      } else if (this.isDivisionHeader(line)) {
        await this.handleDivisionHeader(line);
      } else if (this.isDistrictHeader(line)) {
        await this.handleDistrictHeader(line);
      } else {
        await this.handlePopulationLine(line);
      }
    }

    return this.locations;
  }

  // 6. Main Processing Methods
  private async handleRegionHeader(line: string) {
    const match = line.match(/^\s*(\d+)\s*\.\s*R[EÉ]GION\s*(DE|DU|D[E']|DE LA|DE L'|DES)?\s*(.+)$/i);
    if (!match) {
      console.warn(`Warning: Failed to parse region header: "${line}"`);
      return;
    }

    this.counters[LocationType.REGION]++;
    const regionId = this.counters[LocationType.REGION];

    // Reset all contexts when starting a new region
    this.currentContext = {
      region: null,
      division: null,
      district: null,
      village: null
    };

    this.currentContext.region = {
      locationId: regionId,
      englishName: "",
      name: match[3].trim(),
      geojson: {},
      createdBy: { source: "ADMIN" },
      position: parseInt(match[1].replace(/\s+/g, '')),
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.REGION,
      parentLocationId: null,
      population: 0
    };

    this.locations.set(`region_${regionId}`, this.currentContext.region);
  }

  private async handleDivisionHeader(line: string) {
    const match = line.match(/^\s*(\d+\s*\.\s*\d+)\s*\.\s*D[EÉ]PARTEMENT\s*(DU|DE|D[E']|DE LA|DE L'|DES)?\s*(.+)$/i);
    if (!match || !this.currentContext.region) {
      console.warn(`Warning: Invalid division header or no current region context: "${line}"`);
      return;
    }

    this.counters[LocationType.DIVISION]++;
    const divisionId = this.counters[LocationType.DIVISION];

    // Reset lower-level contexts
    this.currentContext.division = null;
    this.currentContext.district = null;
    this.currentContext.village = null;

    const position = match[1].replace(/\s+/g, '').split('.')[1];
    const divisionName = match[3].trim();
    
    this.currentContext.division = {
      locationId: divisionId,
      englishName: "",
      name: divisionName,
      geojson: {},
      createdBy: { source: "ADMIN" },
      position: parseInt(position),
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.DIVISION,
      parentLocationId: this.currentContext.region.locationId,
      population: 0
    };

    this.locations.set(`division_${divisionId}`, this.currentContext.division);
  }

  private async handleDistrictHeader(line: string) {
    const match = line.match(/^\s*(\d+\s*\.\s*\d+\s*\.\s*\d+)\s*\.\s*ARRONDISSEMENT(?:DE)?\s*(.+)$/i);
    if (!match || !this.currentContext.division) {
      console.warn(`Warning: Invalid district header or no current division context: "${line}"`);
      return;
    }

    this.counters[LocationType.DISTRICT]++;
    const districtId = this.counters[LocationType.DISTRICT];

    // Reset lower-level contexts
    this.currentContext.district = null;
    this.currentContext.village = null;

    const position = match[1].replace(/\s+/g, '').split('.')[2];
    const districtName = match[2].trim();
    
    this.currentContext.district = {
      locationId: districtId,
      englishName: "",
      name: districtName,
      geojson: {},
      createdBy: { source: "ADMIN" },
      position: parseInt(position),
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.DISTRICT,
      parentLocationId: this.currentContext.division.locationId,
      population: 0
    };

    this.locations.set(`district_${districtId}`, this.currentContext.district);
  }

  // 7. Population Processing
  private async handlePopulationLine(line: string) {
    const data = this.parsePopulationLine(line);
    if (!data) return;

    const indentLevel = line.length - line.trimLeft().length;
    
    if (indentLevel <= 16) {
      this.handleVillagePopulation(data);
    } else {
      this.handleLocalityPopulation(data);
    }
  }

  private handleVillagePopulation(data: { name: string; total: number; male: number; female: number }) {
    if (!this.currentContext.district) {
      console.warn(`Warning: Cannot add village "${data.name}" without district context`);
      return;
    }

    this.counters[LocationType.VILLAGE_OR_NEIGHBORHOOD]++;
    const villageId = this.counters[LocationType.VILLAGE_OR_NEIGHBORHOOD];

    this.currentContext.village = {
      locationId: villageId,
      englishName: "",
      name: data.name,
      geojson: {},
      createdBy: { source: "ADMIN" },
      position: villageId,
      capital: false,
      code: "",
      city: data.name.toLowerCase().includes("ville"),
      locationType: LocationType.VILLAGE_OR_NEIGHBORHOOD,
      parentLocationId: this.currentContext.district.locationId,
      population: data.total
    };

    this.locations.set(`village_${villageId}`, this.currentContext.village);
  }

  private handleLocalityPopulation(data: { name: string; total: number; male: number; female: number }) {
    if (!this.currentContext.village) {
      console.warn(`Warning: Cannot add locality "${data.name}" without village context`);
      return;
    }

    this.counters[LocationType.LOCALITY_OR_BLOCK]++;
    const localityId = this.counters[LocationType.LOCALITY_OR_BLOCK];

    const locality: Location = {
      locationId: localityId,
      englishName: "",
      name: data.name,
      geojson: {},
      createdBy: { source: "ADMIN" },
      position: localityId,
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.LOCALITY_OR_BLOCK,
      parentLocationId: this.currentContext.village.locationId,
      population: data.total
    };

    this.locations.set(`locality_${localityId}`, locality);
  }

  static async verifyFileExists(filePath: string): Promise<boolean> {
    const file = Bun.file(filePath);
    return await file.exists();
  }

  static async readFile(filePath: string): Promise<string> {
    const file = Bun.file(filePath);
    return await file.text();
  }

  static async readJSON<T>(filePath: string): Promise<T> {
    const file = Bun.file(filePath);
    return await file.json();
  }

  static async writeJSON(filePath: string, data: any): Promise<void> {
    await Bun.write(filePath, JSON.stringify(data, null, 2));
  }
}

// 8. Validation Class
class PopulationValidator {
  static async validate(
    locations: Map<string, Location>, 
    popCheckPath: string
  ) {
    const popCheck = JSON.parse(
      await require('fs').promises.readFile(popCheckPath, 'utf-8')
    );

    // Validation logic here...
    console.log('\n=== VALIDATION RESULTS ===\n');
    // Add validation reporting...
  }
}

// Main execution following index.ts pattern
const EXPECTED_TOTAL_POPULATION = 17463836;
const EXPECTED_REGIONS = 10;

async function loadPopulationCheckData(): Promise<any> {
  try {
    const file = Bun.file('./pop-check.json');
    const exists = await file.exists();
    if (!exists) {
      console.log("Pop-check.json not found, skipping validation against expected totals");
      return null;
    }
    
    const data = await file.json();
    return data;
  } catch (error) {
    console.error("Error loading population check data:", error);
    return null;
  }
}

async function main() {
  try {
    // Check for input argument
    const textPath = process.argv[2] || './cleaned-loc.txt';
    
    // Load expected population data
    const popCheckData = await loadPopulationCheckData();
    
    // Verify file exists
    const fileExists = await LocationParser.verifyFileExists(textPath);
    if (!fileExists) {
      console.error(`Error: Text file not found at path: ${textPath}`);
      console.error('Please provide a valid path to the text file');
      process.exit(1);
    }
    
    console.log(`Processing location data from: ${textPath}`);
    console.log(`Expected population: ${EXPECTED_TOTAL_POPULATION.toLocaleString()}`);
    console.log(`Expected regions: ${EXPECTED_REGIONS}`);
    
    if (popCheckData) {
      console.log(`Loaded population check data for ${popCheckData.regions.length} regions`);
    }

    // Read and parse the input file
    const content = await LocationParser.readFile(textPath);
    const parser = new LocationParser();
    const locations = await parser.parse(content);

    // Count locations by type
    const locationCounts: { [key: string]: number } = {
      [LocationType.REGION]: 0,
      [LocationType.DIVISION]: 0,
      [LocationType.DISTRICT]: 0,
      [LocationType.VILLAGE_OR_NEIGHBORHOOD]: 0,
      [LocationType.LOCALITY_OR_BLOCK]: 0
    };

    Object.values(locations).forEach(location => {
      locationCounts[location.locationType]++;
    });

    // Display summary
    console.log("\n=== LOCATION COUNT BY TYPE ===");
    for (const type in locationCounts) {
      console.log(`${type}: ${locationCounts[type]}`);
    }
    console.log(`Total locations: ${Object.keys(locations).length}`);

    // Create both full and sample outputs
    const sampleLocations: { [key: string]: any } = {};

    // Add samples of each type
    Object.entries(locations)
      .filter(([key]) => key.startsWith('region_'))
      .slice(0, 2)
      .forEach(([key, value]) => {
        sampleLocations[key] = value;
      });

    Object.entries(locations)
      .filter(([key]) => key.startsWith('division_'))
      .slice(0, 4)
      .forEach(([key, value]) => {
        sampleLocations[key] = value;
      });

    Object.entries(locations)
      .filter(([key]) => key.startsWith('district_'))
      .slice(0, 8)
      .forEach(([key, value]) => {
        sampleLocations[key] = value;
      });

    Object.entries(locations)
      .filter(([key]) => key.startsWith('village_'))
      .slice(0, 16)
      .forEach(([key, value]) => {
        sampleLocations[key] = value;
      });

    Object.entries(locations)
      .filter(([key]) => key.startsWith('locality_'))
      .slice(0, 16)
      .forEach(([key, value]) => {
        sampleLocations[key] = value;
      });

    // Write both full and sample files
    console.log(`\nWriting sample file with ${Object.keys(sampleLocations).length} locations`);
    await LocationParser.writeJSON('./locations_sample.json', sampleLocations);

    console.log(`Writing full data file with ${Object.keys(locations).length} locations`);
    await LocationParser.writeJSON('./locations.json', locations);

    // Validate if pop-check data is available
    if (popCheckData) {
      console.log("\n=== VALIDATING AGAINST EXPECTED POPULATION DATA ===");
      // Validation logic here...
    }

  } catch (error) {
    console.error('Error processing location data:', error);
    process.exit(1);
  }
}

// Run the main function
main();