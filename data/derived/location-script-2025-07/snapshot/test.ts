// Simplify to only handle regions
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

const EXPECTED_REGIONS = 10;

enum LocationType {
  REGION = 'REGION',
  DIVISION = 'DIVISION',
  DISTRICT = 'DISTRICT'
}

class LocationParser {
  private locations = new Map<string, Location>();
  private typeCounters = {
    [LocationType.REGION]: 1,
    [LocationType.DIVISION]: 1,
    [LocationType.DISTRICT]: 1
  };
  private currentRegion: Location | null = null;
  private currentDivision: Location | null = null;

  private isRegionHeader(line: string): boolean {
    // More permissive pattern to catch all region headers
    return /^\s*\d+\s*\.\s*R[EÉ]GION/i.test(line);
  }

  private isPopulationLine(line: string): boolean {
    return /.*\s+\d+\s+\d+\s+\d+\s*$/.test(line);
  }

  private formatRegionName(rawName: string): string {
    // Remove the prefix (DE, DU, etc.) for regions
    return rawName
      .replace(/^(?:L[\u2019']|DE\s+L[\u2019']|DE\s+LA\s+|DE\s+|DU\s+|DES\s+|D[\u2019'])\s*/i, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private formatDivisionName(rawName: string): string {
    let result = rawName;
    
    // First remove any leading dots, spaces, or dashes
    result = result.replace(/^[.\s-]+/, '');
    
    // Then remove DEPARTEMENT
    result = result.replace(/^DEPARTEMENT\s+/i, '');
    
    // Then remove prepositions
    result = result.replace(/^(?:DE LA|DE L'|DU|DE|DES|D')\s+/i, '');
    
    // Remove any remaining prepositions (in case there were multiple)
    result = result.replace(/\s+(?:DE LA|DE L'|DU|DE|DES|D')\s+/i, ' ');
    
    // Normalize spaces and convert to dashes
    result = result.replace(/\s+/g, '-');
    
    return result.trim().toUpperCase();
  }

  private parsePopulation(line: string): number {
    const numbers = line.match(/\d+\s+\d+\s+\d+$/);
    if (numbers) {
      const [total] = numbers[0].split(/\s+/).map(Number);
      return total;
    }
    return 0;
  }

  private isDistrictHeader(line: string): boolean {
    // Match X.X.X format followed by ARRONDISSEMENT
    return /^\s*\d+\s*\.\s*\d+\s*\.\s*\d+\s*\.\s*ARRONDISSEMENT/i.test(line);
  }

  private parseDistrictLine(line: string): { name: string, population: number } | null {
    // Split by spaces and ensure we have at least 4 elements (name parts + 3 numbers)
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) return null;

    // Take the last 3 elements as numbers
    const numbers = parts.slice(-3).map(Number);
    if (numbers.some(isNaN)) return null;

    // Everything before the numbers is the name
    const name = parts.slice(0, -3).join(' ').trim();
    if (!name) return null;

    return {
      name: name,
      population: numbers[0] // First number is total population
    };
  }

  private async handleRegionHeader(line: string) {
    console.log('Processing region line:', line);

    const match = line.match(/^\s*(\d+)\s*\.\s*R[EÉ]GION\s*(DE|DU|D[\u2019']|DE LA|DE L[\u2019']|DES|L[\u2019'])\s*(.+)$/i);
    if (!match) {
      console.warn(`Warning: Failed to parse region header: "${line}"`);
      return;
    }

    const [_, number, prefix, name] = match;
    const fullName = prefix && !prefix.toUpperCase().startsWith("L") ? `${prefix} ${name}` : name;
    const formattedName = this.formatRegionName(fullName); // Use region-specific formatting
    
    const region: Location = {
      locationId: this.typeCounters[LocationType.REGION]++,
      englishName: "",
      name: formattedName,
      geojson: {},
      createdBy: { source: "SYSTEM" },
      position: parseInt(number.replace(/\s+/g, '')),
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.REGION,
      parentLocationId: null,
      population: 0
    };

    this.locations.set(`region_${region.locationId}`, region);
    this.currentRegion = region;
  }

  private async handleDivisionHeader(line: string) {
    const match = line.match(/^\s*(\d+)\s*\.\s*(\d+)\s*(?!\.\s*\d)\s*(.+)$/i);
    if (!match || !this.currentRegion) {
      console.warn(`Warning: Failed to parse division header or no current region: "${line}"`);
      return;
    }

    const [_, regionNum, divisionNum, restOfLine] = match;
    const formattedName = this.formatDivisionName(restOfLine.trim());

    const division: Location = {
      locationId: this.typeCounters[LocationType.DIVISION]++,
      englishName: "",
      name: formattedName,
      geojson: {},
      createdBy: { source: "SYSTEM" },
      position: parseInt(divisionNum),
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.DIVISION,
      parentLocationId: this.currentRegion.locationId,
      population: 0
    };

    this.locations.set(`division_${division.locationId}`, division);
  }

  private isDivisionHeader(line: string): boolean {
    // Match X.X format followed by DEPARTEMENT or just text, but not ARRONDISSEMENT
    return /^\s*\d+\s*\.\s*\d+\s*(?!\.\s*\d)(?!.*ARRONDISSEMENT)/i.test(line);
  }

  private async handleDistrictLine(line: string) {
    if (!this.currentDivision) return;

    const districtData = this.parseDistrictLine(line);
    if (!districtData) return;

    const district: Location = {
      locationId: this.typeCounters[LocationType.DISTRICT]++,
      englishName: districtData.name,
      name: districtData.name.toUpperCase(),
      geojson: {},
      createdBy: { source: "SYSTEM" },
      position: this.typeCounters[LocationType.DISTRICT],
      capital: false,
      code: "",
      city: false,
      locationType: LocationType.DISTRICT,
      parentLocationId: this.currentDivision.locationId,
      population: districtData.population
    };

    this.locations.set(`district_${district.locationId}`, district);

    // Update division's population
    this.currentDivision.population = this.currentDivision.population + district.population;
    this.locations.set(`division_${this.currentDivision.locationId}`, this.currentDivision);

    // Update region's population
    if (this.currentRegion) {
      this.currentRegion.population = this.currentRegion.population + district.population;
      this.locations.set(`region_${this.currentRegion.locationId}`, this.currentRegion);
    }
  }

  async parse(content: string) {
    const lines = content.split('\n');
    let skipNextLine = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.includes('BUCREP')) continue;

      if (this.isRegionHeader(trimmedLine)) {
        await this.handleRegionHeader(trimmedLine);
        this.currentDivision = null;
      } 
      else if (this.isDivisionHeader(trimmedLine)) {
        await this.handleDivisionHeader(trimmedLine);
        this.currentDivision = Array.from(this.locations.values())
          .find(loc => loc.locationType === LocationType.DIVISION && 
                loc.locationId === this.typeCounters[LocationType.DIVISION] - 1) || null;
      }
      else if (this.isDistrictHeader(trimmedLine)) {
        skipNextLine = true; // Skip the next line as it contains the district data
      }
      else if (skipNextLine) {
        await this.handleDistrictLine(trimmedLine);
        skipNextLine = false;
      }
    }

    // Reset all populations to 0 before summing
    for (const location of this.locations.values()) {
      if (location.locationType !== LocationType.DISTRICT) {
        location.population = 0;
      }
    }

    // Recalculate division and region populations from districts
    for (const location of this.locations.values()) {
      if (location.locationType === LocationType.DISTRICT) {
        // Update division population
        const division = Array.from(this.locations.values())
          .find(loc => loc.locationType === LocationType.DIVISION && 
                loc.locationId === location.parentLocationId);
        if (division) {
          division.population += location.population;
          
          // Update region population
          const region = Array.from(this.locations.values())
            .find(loc => loc.locationType === LocationType.REGION && 
                  loc.locationId === division.parentLocationId);
          if (region) {
            region.population += location.population;
          }
        }
      }
    }

    // Calculate and log districts per region
    console.log("\n=== DISTRICTS PER REGION ===");
    const regions = Array.from(this.locations.values())
      .filter(loc => loc.locationType === LocationType.REGION)
      .sort((a, b) => a.position - b.position);

    for (const region of regions) {
      // Get all divisions in this region
      const divisionsInRegion = Array.from(this.locations.values())
        .filter(loc => loc.locationType === LocationType.DIVISION && 
                loc.parentLocationId === region.locationId);
      
      // Get all districts in these divisions
      let districtCount = 0;
      for (const division of divisionsInRegion) {
        const districtsInDivision = Array.from(this.locations.values())
          .filter(loc => loc.locationType === LocationType.DISTRICT && 
                  loc.parentLocationId === division.locationId);
        districtCount += districtsInDivision.length;
      }

      console.log(`${region.name}: ${districtCount} districts`);
    }

    return this.locations;
  }

  static async verifyFileExists(filePath: string): Promise<boolean> {
    const file = Bun.file(filePath);
    return await file.exists();
  }

  static async readFile(filePath: string): Promise<string> {
    const file = Bun.file(filePath);
    return await file.text();
  }

  static async writeJSON(filePath: string, data: any): Promise<void> {
    await Bun.write(filePath, JSON.stringify(data, null, 2));
  }
}

async function main() {
  try {
    const textPath = './cleaned-loc.txt';
    
    // Verify file exists
    const fileExists = await LocationParser.verifyFileExists(textPath);
    if (!fileExists) {
      console.error(`Error: Text file not found at path: ${textPath}`);
      process.exit(1);
    }
    
    console.log(`Processing regions from: ${textPath}`);
    console.log(`Expected regions: ${EXPECTED_REGIONS}`);

    // Read and parse the input file
    const content = await LocationParser.readFile(textPath);
    const parser = new LocationParser();
    const locations = await parser.parse(content);

    // Display results
    console.log("\n=== LOCATIONS FOUND ===");
    
    // First show regions
    console.log("\nREGIONS:");
    const regions = Array.from(locations.values())
      .filter(loc => loc.locationType === LocationType.REGION)
      .sort((a, b) => a.position - b.position);
    
    for (const region of regions) {
      console.log(`${region.position}. ${region.name} (ID: ${region.locationId}, Pop: ${region.population.toLocaleString()})`);
      
      // Show divisions under each region
      const divisions = Array.from(locations.values())
        .filter(loc => loc.locationType === LocationType.DIVISION && 
                loc.parentLocationId === region.locationId)
        .sort((a, b) => a.position - b.position);
      
      for (const division of divisions) {
        console.log(`  ${region.position}.${division.position}. ${division.name} (ID: ${division.locationId}, Pop: ${division.population.toLocaleString()})`);
        
        // Show districts under each division
        const districts = Array.from(locations.values())
          .filter(loc => loc.locationType === LocationType.DISTRICT && 
                  loc.parentLocationId === division.locationId)
          .sort((a, b) => a.position - b.position);
        
        for (const district of districts) {
          console.log(`    ${region.position}.${division.position}.${district.position}. ${district.name} (ID: ${district.locationId}, Pop: ${district.population.toLocaleString()})`);
        }
      }
    }

    // Calculate totals by location type
    const totalsByType = Array.from(locations.values()).reduce((acc, location) => {
      if (!acc[location.locationType]) {
        acc[location.locationType] = {
          count: 0,
          population: 0
        };
      }
      acc[location.locationType].count++;
      acc[location.locationType].population += location.population;
      return acc;
    }, {} as Record<LocationType, { count: number, population: number }>);

    // Display totals
    console.log("\n=== TOTALS BY LOCATION TYPE ===");
    Object.entries(totalsByType).forEach(([type, data]) => {
      console.log(`${type}:`);
      console.log(`  Count: ${data.count}`);
      console.log(`  Total Population: ${data.population.toLocaleString()}`);
    });

    console.log(`\nTotal locations found: ${locations.size}`);

    // Write output
    console.log('\nWriting locations to locations.json');
    await LocationParser.writeJSON('./locations.json', Object.fromEntries(locations));

  } catch (error) {
    console.error('Error processing locations:', error);
    process.exit(1);
  }
}

main();