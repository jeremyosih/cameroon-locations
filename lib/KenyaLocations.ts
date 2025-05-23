import type {
  County,
  Constituency,
  Ward,
  SearchResult,
  SubCounty,
  Area,
  Locality,
} from "./types";
import { counties } from "./data/counties";
import { constituencies } from "./data/constituencies";
import { wards } from "./data/wards";
import { subCounties } from "./data/sub-counties";
import { localities } from "./data/locality";
import { areas } from "./data/area";
import { search as searchFunction } from "./utils/search";

// --- Custom Error Classes ---
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// --- Utility Maps for Fast Lookup ---
const countyCodeMap: Map<string, County> = new Map(
  counties.map((county) => [county.code, county])
);

const countyNameMap: Map<string, County> = new Map(
  counties.map((county) => [county.name.toLowerCase(), county])
);

const constituencyCodeMap: Map<string, Constituency> = new Map(
  constituencies.map((constituency) => [constituency.code, constituency])
);

const constituencyNameMap: Map<string, Constituency> = new Map(
  constituencies.map((constituency) => [
    constituency.name.toLowerCase(),
    constituency,
  ])
);

const wardCodeMap: Map<string, Ward> = new Map(
  wards.map((ward) => [ward.code, ward])
);

const wardNameMap: Map<string, Ward> = new Map(
  wards.map((ward) => [ward.name.toLowerCase(), ward])
);

const localityNameMap: Map<string, Locality> = new Map(
  localities.map((locality) => [locality.name.toLowerCase(), locality])
);

const areaNameMap: Map<string, Area> = new Map(
  areas.map((area) => [area.name.toLowerCase(), area])
);

// --- Additional Utility Maps for County Name to Code Lookup ---
const countyNameToCodeMap: Map<string, string> = new Map(
  counties.map((c) => [c.name, c.code])
);

// --- Relationship Maps ---
// Map of county code to constituencies in that county
const countyToConstituenciesMap: Map<string, Constituency[]> = new Map();
// Map of constituency code to wards in that constituency
const constituencyToWardsMap: Map<string, Ward[]> = new Map();
// Map of county code to wards in that county
const countyToWardsMap: Map<string, Ward[]> = new Map();
// Map of ward code to constituency code
const wardToConstituencyMap: Map<string, string> = new Map();
// Map of constituency code to county code
const constituencyToCountyMap: Map<string, string> = new Map();
// Map of sub-county code to county code
const subCountyToCountyMap: Map<string, string> = new Map();
// Map of county name to localities in that county
const countyToLocalitiesMap: Map<string, Locality[]> = new Map();
// Map of locality name to areas in that locality
const localityToAreasMap: Map<string, Area[]> = new Map();
// Map of county name to areas in that county
const countyToAreasMap: Map<string, Area[]> = new Map();

// Initialize relationship maps
constituencies.forEach((constituency) => {
  // Add to constituency to county relationship
  constituencyToCountyMap.set(constituency.code, constituency.county.code);
  constituencyToCountyMap.set(constituency.name, constituency.county.code);

  // Add to county to constituencies relationship
  const countyCons =
    countyToConstituenciesMap.get(constituency.county.code) || [];
  countyCons.push(constituency);
  countyToConstituenciesMap.set(constituency.county.code, countyCons);
});

wards.forEach((ward) => {
  // Add to ward to constituency relationship
  wardToConstituencyMap.set(ward.code, ward.constituency);

  // Add to constituency to wards relationship
  const consWards = constituencyToWardsMap.get(ward.constituency) || [];
  consWards.push(ward);
  constituencyToWardsMap.set(ward.constituency, consWards);

  // Add to county to wards relationship
  const constituency = constituencyNameMap.get(ward.constituency.toLowerCase());
  if (constituency) {
    const countyCode = constituency.county.code;
    const countyWards = countyToWardsMap.get(countyCode) || [];
    countyWards.push(ward);
    countyToWardsMap.set(countyCode, countyWards);
  }
});

subCounties.forEach((subCounty) => {
  // Get county code from county name
  const countyCode = countyNameToCodeMap.get(subCounty.county);
  if (countyCode) {
    subCountyToCountyMap.set(subCounty.code, countyCode);
  }
});

// Initialize locality relationship maps
localities.forEach((locality) => {
  // Add to county to localities relationship
  const countyLocalities = countyToLocalitiesMap.get(locality.county) || [];
  countyLocalities.push(locality);
  countyToLocalitiesMap.set(locality.county, countyLocalities);
});

// Initialize area relationship maps
areas.forEach((area) => {
  // Add to locality to areas relationship
  const localityAreas = localityToAreasMap.get(area.locality) || [];
  localityAreas.push(area);
  localityToAreasMap.set(area.locality, localityAreas);

  // Add to county to areas relationship
  const countyAreas = countyToAreasMap.get(area.county) || [];
  countyAreas.push(area);
  countyToAreasMap.set(area.county, countyAreas);
});

// --- County and Constituency Classes ---

/**
 * Locality class with methods to access area data
 * @example
 *   const westlands = getLocalityByName('Westlands');
 *   westlands?.areas();
 */
class LocalityWrapper {
  private readonly _data: Locality;

  constructor(data: Locality) {
    this._data = data;
  }

  /** Get the locality name */
  get name(): string {
    return this._data.name;
  }
  /** Get the county this locality belongs to */
  get county(): string {
    return this._data.county;
  }
  /** Get all data for the locality */
  get data(): Locality {
    return { ...this._data };
  }

  /**
   * Get the county this locality belongs to
   * @returns CountyWrapper or undefined if not found
   */
  getCounty(): CountyWrapper | undefined {
    const county = countyNameMap.get(this._data.county.toLowerCase());
    return county ? new CountyWrapper(county) : undefined;
  }

  /**
   * Get all areas in this locality
   * @returns Array of Area
   */
  areas(): Area[] {
    return localityToAreasMap.get(this._data.name) || [];
  }

  /**
   * Get an area by name
   * @param name Name of the area
   * @throws NotFoundError if not found
   */
  area(name: string): Area {
    const localityAreas = this.areas();
    const area = localityAreas.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );

    if (area) {
      return area;
    }

    throw new NotFoundError(
      `Area '${name}' not found in locality '${this._data.name}'.`
    );
  }
}

/**
 * County class with methods to access constituency, locality, and area data
 * @example
 *   const nairobi = county('Nairobi');
 *   nairobi?.constituencies();
 *   nairobi?.localities();
 */
class CountyWrapper {
  private readonly _data: County;

  constructor(data: County) {
    this._data = data;
  }

  /** Get the county code */
  get code(): string {
    return this._data.code;
  }
  /** Get the county name */
  get name(): string {
    return this._data.name;
  }
  /** Get all data for the county */
  get data(): County {
    return { ...this._data };
  }

  /**
   * Get all constituencies in this county
   * @returns Array of ConstituencyWrapper
   */
  constituencies(): ConstituencyWrapper[] {
    const countyCons = countyToConstituenciesMap.get(this._data.code) || [];
    return countyCons.map((c) => new ConstituencyWrapper(c));
  }

  /**
   * Get a constituency by name or code
   * @param nameOrCode Name or code of the constituency
   * @throws NotFoundError if not found
   */
  constituency(nameOrCode: string): ConstituencyWrapper {
    // Try to find by code first
    const constituency = constituencyCodeMap.get(nameOrCode);
    if (constituency && constituency.county.code === this._data.code) {
      return new ConstituencyWrapper(constituency);
    }

    // Then try by name (case-insensitive)
    const nameMatch = constituencyNameMap.get(nameOrCode.toLowerCase());
    if (nameMatch && nameMatch.county.code === this._data.code) {
      return new ConstituencyWrapper(nameMatch);
    }

    // If not found, look through the county's constituencies (slower fallback)
    const countyCons = countyToConstituenciesMap.get(this._data.code) || [];
    const match = countyCons.find(
      (c) => c.name.toLowerCase() === nameOrCode.toLowerCase()
    );

    if (match) {
      return new ConstituencyWrapper(match);
    }

    throw new NotFoundError(
      `Constituency '${nameOrCode}' not found in county '${this._data.name}'.`
    );
  }

  /**
   * Get all wards in this county
   * @returns Array of Ward
   */
  wards(): Ward[] {
    return countyToWardsMap.get(this._data.code) || [];
  }

  /**
   * Get all localities in this county
   * @returns Array of LocalityWrapper
   */
  localities(): LocalityWrapper[] {
    const countyLocalities = countyToLocalitiesMap.get(this._data.name) || [];
    return countyLocalities.map((l) => new LocalityWrapper(l));
  }

  /**
   * Get a locality by name
   * @param name Name of the locality
   * @throws NotFoundError if not found
   */
  locality(name: string): LocalityWrapper {
    const countyLocalities = countyToLocalitiesMap.get(this._data.name) || [];
    const locality = countyLocalities.find(
      (l) => l.name.toLowerCase() === name.toLowerCase()
    );

    if (locality) {
      return new LocalityWrapper(locality);
    }

    throw new NotFoundError(
      `Locality '${name}' not found in county '${this._data.name}'.`
    );
  }

  /**
   * Get all areas in this county
   * @returns Array of Area
   */
  areas(): Area[] {
    return countyToAreasMap.get(this._data.name) || [];
  }

  /**
   * Get areas by locality name
   * @param localityName Name of the locality
   * @returns Array of Area
   */
  areasByLocality(localityName: string): Area[] {
    const allAreas = this.areas();
    return allAreas.filter(
      (area) => area.locality.toLowerCase() === localityName.toLowerCase()
    );
  }
}

/**
 * Constituency class with methods to access ward data
 * @example
 *   const westlands = getConstituencyByCode('290');
 *   westlands?.wards();
 */
class ConstituencyWrapper {
  private readonly _data: Constituency;

  constructor(data: Constituency) {
    this._data = data;
  }

  /** Get the constituency code */
  get code(): string {
    return this._data.code;
  }
  /** Get the constituency name */
  get name(): string {
    return this._data.name;
  }
  /** Get the county this constituency belongs to */
  get county(): County {
    return { ...this._data.county };
  }
  /** Get all data for the constituency */
  get data(): Constituency {
    return { ...this._data };
  }

  /**
   * Get the county this constituency belongs to
   * @returns CountyWrapper
   */
  getCounty(): CountyWrapper {
    return new CountyWrapper(this._data.county);
  }

  /**
   * Get a ward in this constituency by name or code
   */
  ward(nameOrCode: string): Ward {
    // Try to find by code
    const ward = wardCodeMap.get(nameOrCode);
    if (ward && ward.constituency === this._data.name) {
      return ward;
    }

    // Try by name from the name map
    const nameMatch = wardNameMap.get(nameOrCode.toLowerCase());
    if (nameMatch && nameMatch.constituency === this._data.name) {
      return nameMatch;
    }

    // If still not found, do a more thorough search
    const wardsByName = wards.filter(
      (w) =>
        w.constituency === this._data.name &&
        w.name.toLowerCase() === nameOrCode.toLowerCase()
    );

    if (wardsByName.length === 0) {
      throw new NotFoundError(
        `Ward '${nameOrCode}' not found in constituency '${this._data.name}'`
      );
    }

    if (wardsByName.length > 1) {
      throw new KenyaLocationsError(
        `Multiple wards named '${nameOrCode}' found in constituency '${this._data.name}'. Use specific ward code instead.`
      );
    }

    return wardsByName[0];
  }

  /**
   * Get all wards in this constituency
   */
  wards(): Ward[] {
    return constituencyToWardsMap.get(this._data.name) || [];
  }
}

/**
 * Custom error class for KenyaLocations
 */
export class KenyaLocationsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KenyaLocationsError";
  }
}

// Define standalone functions first, before the class definition

/**
 * Get all counties
 */
export function getCounties(): County[] {
  return counties;
}

/**
 * Get all sub-counties
 */
export function getSubCounties(): SubCounty[] {
  return subCounties;
}

/**
 * Get all wards
 */
export function getWards(): Ward[] {
  return wards;
}

/**
 * Get all localities
 */
export function getLocalities(): Locality[] {
  return localities;
}

/**
 * Get all areas
 */
export function getAreas(): Area[] {
  return areas;
}

/**
 * Get a county by its code
 */
export function getCountyByCode(code: string): County | undefined {
  return countyCodeMap.get(code);
}

/**
 * Get a locality by its name
 */
export function getLocalityByName(name: string): LocalityWrapper | undefined {
  const locality = localityNameMap.get(name.toLowerCase());
  return locality ? new LocalityWrapper(locality) : undefined;
}

/**
 * Get an area by its name
 */
export function getAreaByName(name: string): Area | undefined {
  return areaNameMap.get(name.toLowerCase());
}

/**
 * Get all localities in a county
 * @param countyName County name
 */
export function getLocalitiesInCounty(countyName: string): Locality[] {
  return countyToLocalitiesMap.get(countyName) || [];
}

/**
 * Get all areas in a locality
 * @param localityName Locality name
 */
export function getAreasInLocality(localityName: string): Area[] {
  return localityToAreasMap.get(localityName) || [];
}

/**
 * Get all areas in a county
 * @param countyName County name
 */
export function getAreasInCounty(countyName: string): Area[] {
  return countyToAreasMap.get(countyName) || [];
}

/**
 * Get the county of a locality
 * @param localityName The name of the locality
 */
export function getCountyOfLocality(localityName: string): County | undefined {
  const locality = localityNameMap.get(localityName.toLowerCase());
  if (!locality) return undefined;

  return countyNameMap.get(locality.county.toLowerCase());
}

/**
 * Get the county of an area
 * @param areaName The name of the area
 */
export function getCountyOfArea(areaName: string): County | undefined {
  const area = areaNameMap.get(areaName.toLowerCase());
  if (!area) return undefined;

  return countyNameMap.get(area.county.toLowerCase());
}

/**
 * Get the locality of an area
 * @param areaName The name of the area
 */
export function getLocalityOfArea(areaName: string): Locality | undefined {
  const area = areaNameMap.get(areaName.toLowerCase());
  if (!area) return undefined;

  return localityNameMap.get(area.locality.toLowerCase());
}

/**
 * Get all sub-counties in a county
 * @param nameOrCode County name or code
 */
export function getSubCountiesInCounty(nameOrCode: string): SubCounty[] {
  const county = countyCodeMap.get(nameOrCode);
  if (county) {
    return subCounties.filter((subCounty) => subCounty.county === county.name);
  }

  const countyByName = countyNameMap.get(nameOrCode.toLowerCase());
  if (countyByName) {
    return subCounties.filter(
      (subCounty) => subCounty.county === countyByName.name
    );
  }
  return [];
}

/**
 * Get all wards in a sub-county
 */
export function getWardsInSubCounty(subCountyCode: string): Ward[] {
  return wards.filter((ward) => ward.constituency === subCountyCode);
}

/**
 * Get the county of a sub-county
 * @param subCountyName The name of the sub-county
 */
export function getCountyOfSubCounty(
  subCountyName: string
): County | undefined {
  const subCounty = subCounties.find(
    (subCounty) => subCounty.name === subCountyName
  );
  if (!subCounty) return undefined;

  return counties.find((county) => subCounty.county == county.name);
}

/**
 * Get the county that a ward belongs to by ward name or code
 */
export function getCountyOfWard(wardNameOrCode: string): County | undefined {
  // First try by code
  const constituency = wardToConstituencyMap.get(wardNameOrCode);
  if (constituency) {
    const countyCode = constituencyToCountyMap.get(constituency);
    if (countyCode) {
      return countyCodeMap.get(countyCode);
    }
  }

  // Then try by name
  const ward = wardNameMap.get(wardNameOrCode.toLowerCase());
  if (ward) {
    const constituency = ward.constituency;
    const countyCode = constituencyToCountyMap.get(constituency);
    if (countyCode) {
      return countyCodeMap.get(countyCode);
    }
  }

  return undefined;
}

/**
 * Get a county by name or code
 */
export function county(nameOrCode: string): CountyWrapper | undefined {
  // Try by code
  let found = countyCodeMap.get(nameOrCode);

  // Try by lowercase name
  if (!found) {
    found = countyNameMap.get(nameOrCode.toLowerCase());
  }

  // Fallback to case-insensitive name search
  if (!found) {
    found = counties.find(
      (c) => c.name.toLowerCase() === nameOrCode.toLowerCase()
    );
  }

  return found ? new CountyWrapper(found) : undefined;
}

/**
 * Get a locality by name or county
 */
export function locality(
  name: string,
  countyName?: string
): LocalityWrapper | undefined {
  if (countyName) {
    // Search within specific county
    const countyLocalities = countyToLocalitiesMap.get(countyName) || [];
    const found = countyLocalities.find(
      (l) => l.name.toLowerCase() === name.toLowerCase()
    );
    return found ? new LocalityWrapper(found) : undefined;
  }

  // Search globally
  const found = localityNameMap.get(name.toLowerCase());
  return found ? new LocalityWrapper(found) : undefined;
}

/**
 * Get all constituencies
 */
export function getConstituencies(): Constituency[] {
  return constituencies;
}

/**
 * Get a constituency by code
 */
export function getConstituencyByCode(
  code: string
): ConstituencyWrapper | undefined {
  const constituency = constituencyCodeMap.get(code);
  return constituency ? new ConstituencyWrapper(constituency) : undefined;
}

/**
 * Get all wards in a county
 */
export function getWardsInCounty(countyNameOrCode: string): Ward[] {
  // Try by code first
  if (countyToWardsMap.has(countyNameOrCode)) {
    return countyToWardsMap.get(countyNameOrCode) || [];
  }

  // Try by name (case-insensitive)
  const countyByName = countyNameMap.get(countyNameOrCode.toLowerCase());
  if (countyByName) {
    return countyToWardsMap.get(countyByName.code) || [];
  }

  return [];
}

/**
 * Search for counties, constituencies, wards, localities, or areas
 */
export function search(query: string, limit?: number): SearchResult[] {
  return searchFunction(query, limit);
}

/**
 * Get all wards in a constituency by name or code
 */
export function getWardsInConstituency(constituencyNameOrCode: string): Ward[] {
  // First try by name
  const wardsByName = constituencyToWardsMap.get(constituencyNameOrCode);
  if (wardsByName) {
    return wardsByName;
  }

  // Then try by code - find constituency by code and get its name
  const constituency = constituencyCodeMap.get(constituencyNameOrCode);
  if (constituency) {
    return constituencyToWardsMap.get(constituency.name) || [];
  }

  return [];
}

/**
 * Get the county that a constituency belongs to
 */
export function getCountyOfConstituency(
  constituencyNameOrCode: string
): County | undefined {
  // First try by name
  const constituency = constituencyNameMap.get(
    constituencyNameOrCode.toLowerCase()
  );
  if (constituency) {
    return constituency.county;
  }

  // Then try by code
  const constituencyByCode = constituencyCodeMap.get(constituencyNameOrCode);
  if (constituencyByCode) {
    return constituencyByCode.county;
  }

  return undefined;
}

/**
 * Main class for working with Kenya's administrative locations
 */
export class KenyaLocations {
  private static instance: KenyaLocations;

  /**
   * Get the singleton instance of KenyaLocations
   */
  public static getInstance(): KenyaLocations {
    if (!KenyaLocations.instance) {
      KenyaLocations.instance = new KenyaLocations();
    }
    return KenyaLocations.instance;
  }

  // Static methods that call the standalone functions
  public static getCounties = getCounties;
  public static getSubCounties = getSubCounties;
  public static getWards = getWards;
  public static getLocalities = getLocalities;
  public static getAreas = getAreas;
  public static getCountyByCode = getCountyByCode;
  public static getLocalityByName = getLocalityByName;
  public static getAreaByName = getAreaByName;
  public static getLocalitiesInCounty = getLocalitiesInCounty;
  public static getAreasInLocality = getAreasInLocality;
  public static getAreasInCounty = getAreasInCounty;
  public static getCountyOfLocality = getCountyOfLocality;
  public static getCountyOfArea = getCountyOfArea;
  public static getLocalityOfArea = getLocalityOfArea;
  public static getSubCountiesInCounty = getSubCountiesInCounty;
  public static getWardsInSubCounty = getWardsInSubCounty;
  public static getCountyOfSubCounty = getCountyOfSubCounty;
  public static getCountyOfWard = getCountyOfWard;
  public static county = county;
  public static locality = locality;
  public static getConstituencies = getConstituencies;
  public static getConstituencyByCode = getConstituencyByCode;
  public static getWardsInCounty = getWardsInCounty;
  public static search = search;
  public static getWardsInConstituency = getWardsInConstituency;
  public static getCountyOfConstituency = getCountyOfConstituency;
}

// Export wrappers and error for advanced use
export { CountyWrapper, ConstituencyWrapper, LocalityWrapper, NotFoundError };

// Default export for convenience
export default KenyaLocations;
