import type {
  County,
  Constituency,
  Ward,
  SearchResult,
  SubCounty,
} from "./types";
import { counties, constituencies, wards } from "./data";
import { search as searchUtils } from "./utils";
import { subCounties } from "./data/sub-counties";

// --- Custom Error Classes ---
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// --- Utility Maps for Fast Lookup ---
const countyCodeMap: Map<string, County> = new Map(
  counties.map((c) => [c.code, c])
);

const countyNameMap: Map<string, County> = new Map(
  counties.map((c) => [c.name.toLowerCase(), c])
);

const constituencyCodeMap: Map<string, Constituency> = new Map(
  constituencies.map((c) => [c.code, c])
);

const constituencyNameMap: Map<string, Constituency> = new Map(
  constituencies.map((c) => [c.name.toLowerCase(), c])
);

const wardCodeMap: Map<string, Ward> = new Map(wards.map((w) => [w.code, w]));

const wardNameMap: Map<string, Ward> = new Map(
  wards.map((w) => [w.name.toLowerCase(), w])
);

const subCountyCodeMap: Map<string, SubCounty> = new Map(
  subCounties.map((sc) => [sc.code, sc])
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

// Initialize relationship maps
constituencies.forEach((constituency) => {
  // Add to constituency to county relationship
  constituencyToCountyMap.set(constituency.code, constituency.countyCode);

  // Add to county to constituencies relationship
  const countyCons =
    countyToConstituenciesMap.get(constituency.countyCode) || [];
  countyCons.push(constituency);
  countyToConstituenciesMap.set(constituency.countyCode, countyCons);
});

wards.forEach((ward) => {
  // Add to ward to constituency relationship
  wardToConstituencyMap.set(ward.code, ward.constituencyCode);

  // Add to constituency to wards relationship
  const consWards = constituencyToWardsMap.get(ward.constituencyCode) || [];
  consWards.push(ward);
  constituencyToWardsMap.set(ward.constituencyCode, consWards);

  // Add to county to wards relationship
  const constituencyCode = ward.constituencyCode;
  const countyCode = constituencyToCountyMap.get(constituencyCode);
  if (countyCode) {
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

// --- County and Constituency Classes ---

/**
 * County class with methods to access constituency data
 * @example
 *   const nairobi = county('Nairobi');
 *   nairobi?.constituencies();
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
    if (constituency && constituency.countyCode === this._data.code) {
      return new ConstituencyWrapper(constituency);
    }

    // Then try by name (case-insensitive)
    const nameMatch = constituencyNameMap.get(nameOrCode.toLowerCase());
    if (nameMatch && nameMatch.countyCode === this._data.code) {
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
  /** Get the county code this constituency belongs to */
  get countyCode(): string {
    return this._data.countyCode;
  }
  /** Get all data for the constituency */
  get data(): Constituency {
    return { ...this._data };
  }

  /**
   * Get the county this constituency belongs to
   * @returns CountyWrapper
   * @throws NotFoundError if not found
   */
  county(): CountyWrapper {
    const county = countyCodeMap.get(this._data.countyCode);
    if (!county)
      throw new NotFoundError(
        `County code '${this._data.countyCode}' not found.`
      );
    return new CountyWrapper(county);
  }

  /**
   * Get all wards in this constituency
   * @returns Array of Ward
   */
  wards(): Ward[] {
    return constituencyToWardsMap.get(this._data.code) || [];
  }

  /**
   * Get a ward by name or code
   * @param nameOrCode Name or code of the ward
   * @throws NotFoundError if not found
   */
  ward(nameOrCode: string): Ward {
    // Try to find by code
    const ward = wardCodeMap.get(nameOrCode);
    if (ward && ward.constituencyCode === this._data.code) {
      return ward;
    }

    // Try by name from the name map
    const nameMatch = wardNameMap.get(nameOrCode.toLowerCase());
    if (nameMatch && nameMatch.constituencyCode === this._data.code) {
      return nameMatch;
    }

    // Fallback: Find by name using filtering (slower)
    const wardsByName = wards.filter(
      (w) =>
        w.constituencyCode === this._data.code &&
        w.name.toLowerCase() === nameOrCode.toLowerCase()
    );

    if (wardsByName.length > 0) {
      return wardsByName[0];
    }

    throw new NotFoundError(
      `Ward '${nameOrCode}' not found in constituency '${this._data.name}'.`
    );
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
export function getAllCounties(): County[] {
  return counties;
}

/**
 * Get all sub-counties
 */
export function getAllSubCounties(): SubCounty[] {
  return subCounties;
}

/**
 * Get all wards
 */
export function getAllWards(): Ward[] {
  return wards;
}

/**
 * Get a county by its code
 */
export function getCountyByCode(code: string): County | undefined {
  return countyCodeMap.get(code);
}

/**
 * Get a sub-county by its code
 */
export function getSubCountyByCode(code: string): SubCounty | undefined {
  return subCountyCodeMap.get(code);
}

/**
 * Get a ward by its code
 */
export function getWardByCode(code: string): Ward | undefined {
  return wardCodeMap.get(code);
}

/**
 * Get all sub-counties in a county
 */
export function getSubCountiesInCounty(countyCode: string): SubCounty[] {
  // Try to get county name from code
  const county = countyCodeMap.get(countyCode);
  if (!county) return [];

  return subCounties.filter((subCounty) => subCounty.county === county.name);
}

/**
 * Get all wards in a sub-county
 */
export function getWardsInSubCounty(subCountyCode: string): Ward[] {
  return wards.filter((ward) => ward.constituencyCode === subCountyCode);
}

/**
 * Get the county of a sub-county
 */
export function getCountyOfSubCounty(
  subCountyCode: string
): County | undefined {
  const subCounty = subCountyCodeMap.get(subCountyCode);
  if (!subCounty) return undefined;

  // Find county by name
  return counties.find((county) => county.name === subCounty.county);
}

/**
 * Get the county of a ward
 */
export function getCountyOfWard(wardCode: string): County | undefined {
  const constituencyCode = wardToConstituencyMap.get(wardCode);
  if (!constituencyCode) return undefined;

  const countyCode = constituencyToCountyMap.get(constituencyCode);
  if (!countyCode) return undefined;

  return countyCodeMap.get(countyCode);
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
 * Get all constituencies
 */
export function getAllConstituencies(): Constituency[] {
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
export function getAllWardsInCounty(countyNameOrCode: string): Ward[] {
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
 * Search for counties, constituencies, or wards
 */
export function search(query: string, limit?: number): SearchResult[] {
  return searchUtils(query, limit);
}

/**
 * Get all wards in a constituency
 */
export function getWardsInConstituency(constituencyCode: string): Ward[] {
  return constituencyToWardsMap.get(constituencyCode) || [];
}

/**
 * Get the county of a constituency
 */
export function getCountyOfConstituency(
  constituencyCode: string
): County | undefined {
  const countyCode = constituencyToCountyMap.get(constituencyCode);
  if (!countyCode) return undefined;

  return countyCodeMap.get(countyCode);
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
  public static getAllCounties = getAllCounties;
  public static getAllSubCounties = getAllSubCounties;
  public static getAllWards = getAllWards;
  public static getCountyByCode = getCountyByCode;
  public static getSubCountyByCode = getSubCountyByCode;
  public static getWardByCode = getWardByCode;
  public static getSubCountiesInCounty = getSubCountiesInCounty;
  public static getWardsInSubCounty = getWardsInSubCounty;
  public static getCountyOfSubCounty = getCountyOfSubCounty;
  public static getCountyOfWard = getCountyOfWard;
  public static county = county;
  public static getAllConstituencies = getAllConstituencies;
  public static getConstituencyByCode = getConstituencyByCode;
  public static getAllWardsInCounty = getAllWardsInCounty;
  public static search = search;
  public static getWardsInConstituency = getWardsInConstituency;
  public static getCountyOfConstituency = getCountyOfConstituency;
}

// Export wrappers and error for advanced use
export { CountyWrapper, ConstituencyWrapper, NotFoundError };

// Default export for convenience
export default KenyaLocations;
