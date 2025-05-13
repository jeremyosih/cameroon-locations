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
    return constituencies
      .filter((c) => c.countyCode === this._data.code)
      .map((c) => new ConstituencyWrapper(c));
  }

  /**
   * Get a constituency by name or code
   * @param nameOrCode Name or code of the constituency
   * @throws NotFoundError if not found
   */
  constituency(nameOrCode: string): ConstituencyWrapper {
    const codeMatch = constituencies.find(
      (c) => c.countyCode === this._data.code && c.code === nameOrCode
    );
    if (codeMatch) return new ConstituencyWrapper(codeMatch);
    const nameMatch = constituencies.find(
      (c) =>
        c.countyCode === this._data.code &&
        c.name.toLowerCase() === nameOrCode.toLowerCase()
    );
    if (nameMatch) return new ConstituencyWrapper(nameMatch);
    throw new NotFoundError(
      `Constituency '${nameOrCode}' not found in county '${this._data.name}'.`
    );
  }

  /**
   * Get all wards in this county
   * @returns Array of Ward
   */
  wards(): Ward[] {
    const codes = constituencies
      .filter((c) => c.countyCode === this._data.code)
      .map((c) => c.code);
    return wards.filter((w) => codes.includes(w.constituencyCode));
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
    return wards.filter((w) => w.constituencyCode === this._data.code);
  }

  /**
   * Get a ward by name or code
   * @param nameOrCode Name or code of the ward
   * @throws NotFoundError if not found
   */
  ward(nameOrCode: string): Ward {
    const codeMatch = wards.find(
      (w) => w.constituencyCode === this._data.code && w.code === nameOrCode
    );
    if (codeMatch) return codeMatch;
    const nameMatch = wards.find(
      (w) =>
        w.constituencyCode === this._data.code &&
        w.name.toLowerCase() === nameOrCode.toLowerCase()
    );
    if (nameMatch) return nameMatch;
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
  return counties.find((county) => county.code === code);
}

/**
 * Get a sub-county by its code
 */
export function getSubCountyByCode(code: string): SubCounty | undefined {
  return subCounties.find((subCounty) => subCounty.code === code);
}

/**
 * Get a ward by its code
 */
export function getWardByCode(code: string): Ward | undefined {
  return wards.find((ward) => ward.code === code);
}

/**
 * Get all sub-counties in a county
 */
export function getSubCountiesInCounty(countyCode: string): SubCounty[] {
  return subCounties.filter((subCounty) => subCounty.countyCode === countyCode);
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
  const subCounty = subCounties.find((sc) => sc.code === subCountyCode);
  if (!subCounty) return undefined;
  return counties.find((county) => county.code === subCounty.countyCode);
}

/**
 * Get the county of a ward
 */
export function getCountyOfWard(wardCode: string): County | undefined {
  const ward = wards.find((w) => w.code === wardCode);
  if (!ward) return undefined;
  const constituency = constituencies.find(
    (c) => c.code === ward.constituencyCode
  );
  if (!constituency) return undefined;
  return counties.find((county) => county.code === constituency.countyCode);
}

/**
 * Get a county by name or code
 */
export function county(nameOrCode: string): CountyWrapper | undefined {
  const codeMatch = counties.find((c) => c.code === nameOrCode);
  if (codeMatch) return new CountyWrapper(codeMatch);
  const nameMatch = counties.find(
    (c) => c.name.toLowerCase() === nameOrCode.toLowerCase()
  );
  if (nameMatch) return new CountyWrapper(nameMatch);
  return undefined;
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
  const constituency = constituencies.find((c) => c.code === code);
  if (!constituency) return undefined;
  return new ConstituencyWrapper(constituency);
}

/**
 * Get all wards in a county
 */
export function getAllWardsInCounty(countyNameOrCode: string): Ward[] {
  const countyInstance = county(countyNameOrCode);
  if (!countyInstance) return [];
  const constituencyCodes = countyInstance.constituencies().map((c) => c.code);
  return wards.filter((w) => constituencyCodes.includes(w.constituencyCode));
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
  return wards.filter((ward) => ward.constituencyCode === constituencyCode);
}

/**
 * Get the county of a constituency
 */
export function getCountyOfConstituency(
  constituencyCode: string
): County | undefined {
  const constituency = constituencies.find((c) => c.code === constituencyCode);
  if (!constituency) return undefined;
  return counties.find((county) => county.code === constituency.countyCode);
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
