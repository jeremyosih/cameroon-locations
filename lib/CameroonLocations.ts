import type {
  Region,
  Division,
  Subdivision,
  District,
  SearchResult,
  Language,
  SearchOptions,
} from "./types";
import { regions } from "./data/regions";
import { divisions } from "./data/divisions";
import { subdivisions } from "./data/subdivisions";
import { districts } from "./data/districts";
import {
  search as searchFunction,
  searchByType as searchByTypeFunction,
} from "./utils/search";

// --- Custom Error Classes ---
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class CameroonLocationsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CameroonLocationsError";
  }
}

// --- Multiple Lookup Maps for All Code Types and Languages ---

// Region lookup maps
const regionCodeMap: Map<string, Region> = new Map();
const regionHascMap: Map<string, Region> = new Map();
const regionPcodeMap: Map<string, Region> = new Map();
const regionNameFrMap: Map<string, Region> = new Map();
const regionNameEnMap: Map<string, Region> = new Map();

// Division lookup maps
const divisionCodeMap: Map<string, Division> = new Map();
const divisionHascMap: Map<string, Division> = new Map();
const divisionPcodeMap: Map<string, Division> = new Map();
const divisionNameFrMap: Map<string, Division> = new Map();
const divisionNameEnMap: Map<string, Division> = new Map();

// Subdivision lookup maps
const subdivisionCodeMap: Map<string, Subdivision> = new Map();
const subdivisionHascMap: Map<string, Subdivision> = new Map();
const subdivisionPcodeMap: Map<string, Subdivision> = new Map();
const subdivisionNameFrMap: Map<string, Subdivision> = new Map();
const subdivisionNameEnMap: Map<string, Subdivision> = new Map();

// District lookup maps
const districtCodeMap: Map<string, District> = new Map();
const districtHascMap: Map<string, District> = new Map();
const districtPcodeMap: Map<string, District> = new Map();
const districtNameFrMap: Map<string, District> = new Map();
const districtNameEnMap: Map<string, District> = new Map();

// --- Relationship Maps ---
const regionToDivisionsMap: Map<string, Division[]> = new Map();
const divisionToSubdivisionsMap: Map<string, Subdivision[]> = new Map();
const subdivisionToDistrictsMap: Map<string, District[]> = new Map();
const regionToSubdivisionsMap: Map<string, Subdivision[]> = new Map();
const regionToDistrictsMap: Map<string, District[]> = new Map();
const divisionToDistrictsMap: Map<string, District[]> = new Map();
const subdivisionToDivisionMap: Map<string, string> = new Map();
const divisionToRegionMap: Map<string, string> = new Map();
const districtToSubdivisionMap: Map<string, string> = new Map();
const districtToDivisionMap: Map<string, string> = new Map();
const districtToRegionMap: Map<string, string> = new Map();

// Initialize all lookup maps
regions.forEach((region) => {
  // Code-based lookups
  regionCodeMap.set(region.code, region);
  if (region.hasc) regionHascMap.set(region.hasc, region);
  if (region.pcode) regionPcodeMap.set(region.pcode, region);

  // Language-based lookups
  regionNameFrMap.set(region.nameFr.toLowerCase(), region);
  regionNameEnMap.set(region.nameEn.toLowerCase(), region);
});

divisions.forEach((division) => {
  // Code-based lookups
  divisionCodeMap.set(division.code, division);
  if (division.hasc) divisionHascMap.set(division.hasc, division);
  if (division.pcode) divisionPcodeMap.set(division.pcode, division);

  // Language-based lookups
  divisionNameFrMap.set(division.nameFr.toLowerCase(), division);
  divisionNameEnMap.set(division.nameEn.toLowerCase(), division);

  // Relationship mapping
  const regionCode = regions.find((r) => r.nameFr === division.region)?.code;
  if (regionCode) {
    divisionToRegionMap.set(division.code, regionCode);
    divisionToRegionMap.set(division.nameFr, regionCode);

    const regionDivs = regionToDivisionsMap.get(regionCode) || [];
    regionDivs.push(division);
    regionToDivisionsMap.set(regionCode, regionDivs);
  }
});

subdivisions.forEach((subdivision) => {
  // Code-based lookups
  subdivisionCodeMap.set(subdivision.code, subdivision);
  if (subdivision.hasc) subdivisionHascMap.set(subdivision.hasc, subdivision);
  if (subdivision.pcode)
    subdivisionPcodeMap.set(subdivision.pcode, subdivision);

  // Language-based lookups
  subdivisionNameFrMap.set(subdivision.nameFr.toLowerCase(), subdivision);
  subdivisionNameEnMap.set(subdivision.nameEn.toLowerCase(), subdivision);

  // Relationship mapping
  const divisionCode = divisions.find(
    (d) => d.nameFr === subdivision.division
  )?.code;
  if (divisionCode) {
    subdivisionToDivisionMap.set(subdivision.code, divisionCode);
    subdivisionToDivisionMap.set(subdivision.nameFr, divisionCode);

    const divisionSubs = divisionToSubdivisionsMap.get(divisionCode) || [];
    divisionSubs.push(subdivision);
    divisionToSubdivisionsMap.set(divisionCode, divisionSubs);

    const regionCode = divisionToRegionMap.get(divisionCode);
    if (regionCode) {
      const regionSubs = regionToSubdivisionsMap.get(regionCode) || [];
      regionSubs.push(subdivision);
      regionToSubdivisionsMap.set(regionCode, regionSubs);
    }
  }
});

districts.forEach((district) => {
  // Code-based lookups
  districtCodeMap.set(district.code, district);
  if (district.hasc) districtHascMap.set(district.hasc, district);
  if (district.pcode) districtPcodeMap.set(district.pcode, district);

  // Language-based lookups
  districtNameFrMap.set(district.nameFr.toLowerCase(), district);
  districtNameEnMap.set(district.nameEn.toLowerCase(), district);

  // Relationship mapping
  const subdivisionCode = subdivisions.find(
    (s) => s.nameFr === district.subdivision
  )?.code;
  if (subdivisionCode) {
    districtToSubdivisionMap.set(district.code, subdivisionCode);
    districtToSubdivisionMap.set(district.nameFr, subdivisionCode);

    const subdivisionDists =
      subdivisionToDistrictsMap.get(subdivisionCode) || [];
    subdivisionDists.push(district);
    subdivisionToDistrictsMap.set(subdivisionCode, subdivisionDists);

    const divisionCode = subdivisionToDivisionMap.get(subdivisionCode);
    if (divisionCode) {
      districtToDivisionMap.set(district.code, divisionCode);
      districtToDivisionMap.set(district.nameFr, divisionCode);

      const divisionDists = divisionToDistrictsMap.get(divisionCode) || [];
      divisionDists.push(district);
      divisionToDistrictsMap.set(divisionCode, divisionDists);

      const regionCode = divisionToRegionMap.get(divisionCode);
      if (regionCode) {
        districtToRegionMap.set(district.code, regionCode);
        districtToRegionMap.set(district.nameFr, regionCode);

        const regionDists = regionToDistrictsMap.get(regionCode) || [];
        regionDists.push(district);
        regionToDistrictsMap.set(regionCode, regionDists);
      }
    }
  }
});

// --- Enhanced Wrapper Classes with Bilingual Support ---
class RegionWrapper {
  private readonly _data: Region;

  constructor(data: Region) {
    this._data = data;
  }

  /** Get the region code (numeric) */
  get code(): string {
    return this._data.code;
  }

  /** Get the region name (French, primary) */
  get name(): string {
    return this._data.nameFr;
  }

  /** Get the French name */
  get nameFr(): string {
    return this._data.nameFr;
  }

  /** Get the English name */
  get nameEn(): string {
    return this._data.nameEn;
  }

  /** Get the HASC code (optional) */
  get hasc(): string | undefined {
    return this._data.hasc;
  }

  /** Get the P-code (optional) */
  get pcode(): string | undefined {
    return this._data.pcode;
  }

  /** Get all data for the region */
  get data(): Region {
    return { ...this._data };
  }

  /**
   * Get name in specified language
   * @param language Language preference ('fr' or 'en')
   */
  getName(language: Language = "fr"): string {
    return language === "en" ? this._data.nameEn : this._data.nameFr;
  }

  /**
   * Get all codes for this region
   */
  getAllCodes(): { code: string; hasc?: string; pcode?: string } {
    return {
      code: this._data.code,
      hasc: this._data.hasc,
      pcode: this._data.pcode,
    };
  }

  /**
   * Get all divisions in this region
   * @returns Array of DivisionWrapper
   */
  divisions(): DivisionWrapper[] {
    const regionDivs = regionToDivisionsMap.get(this._data.code) || [];
    return regionDivs.map((d) => new DivisionWrapper(d));
  }

  /**
   * Get a division by name or code
   * @param nameOrCode Name (any language) or code (any type) of the division
   * @throws NotFoundError if not found
   */
  division(nameOrCode: string): DivisionWrapper {
    // Try all lookup methods
    const division =
      divisionCodeMap.get(nameOrCode) ||
      divisionHascMap.get(nameOrCode) ||
      divisionPcodeMap.get(nameOrCode) ||
      divisionNameFrMap.get(nameOrCode.toLowerCase()) ||
      divisionNameEnMap.get(nameOrCode.toLowerCase());

    if (division && division.region === this._data.nameFr) {
      return new DivisionWrapper(division);
    }

    // If not found, look through the region's divisions (slower fallback)
    const regionDivs = regionToDivisionsMap.get(this._data.code) || [];
    const match = regionDivs.find(
      (d) =>
        d.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        d.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        d.code === nameOrCode ||
        d.hasc === nameOrCode ||
        d.pcode === nameOrCode
    );

    if (match) {
      return new DivisionWrapper(match);
    }

    throw new NotFoundError(
      `Division "${nameOrCode}" not found in region "${this._data.nameFr}"`
    );
  }

  /**
   * Get all subdivisions in this region
   * @returns Array of SubdivisionWrapper
   */
  subdivisions(): SubdivisionWrapper[] {
    const regionSubs = regionToSubdivisionsMap.get(this._data.code) || [];
    return regionSubs.map((s) => new SubdivisionWrapper(s));
  }

  /**
   * Get all districts in this region
   * @returns Array of DistrictWrapper
   */
  districts(): DistrictWrapper[] {
    const regionDists = regionToDistrictsMap.get(this._data.code) || [];
    return regionDists.map((d) => new DistrictWrapper(d));
  }
}

class DivisionWrapper {
  private readonly _data: Division;

  constructor(data: Division) {
    this._data = data;
  }

  /** Get the division code */
  get code(): string {
    return this._data.code;
  }

  /** Get the division name (French, primary) */
  get name(): string {
    return this._data.nameFr;
  }

  /** Get the French name */
  get nameFr(): string {
    return this._data.nameFr;
  }

  /** Get the English name */
  get nameEn(): string {
    return this._data.nameEn;
  }

  /** Get the HASC code (optional) */
  get hasc(): string | undefined {
    return this._data.hasc;
  }

  /** Get the P-code (optional) */
  get pcode(): string | undefined {
    return this._data.pcode;
  }

  /** Get all data for the division */
  get data(): Division {
    return { ...this._data };
  }

  /**
   * Get name in specified language
   * @param language Language preference ('fr' or 'en')
   */
  getName(language: Language = "fr"): string {
    return language === "en" ? this._data.nameEn : this._data.nameFr;
  }

  /**
   * Get all codes for this division
   */
  getAllCodes(): { code: string; hasc?: string; pcode?: string } {
    return {
      code: this._data.code,
      hasc: this._data.hasc,
      pcode: this._data.pcode,
    };
  }

  /**
   * Get the region this division belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    const regionCode = divisionToRegionMap.get(this._data.code);
    if (!regionCode) {
      throw new NotFoundError(
        `Region for division "${this._data.nameFr}" not found`
      );
    }
    const reg = regionCodeMap.get(regionCode);
    if (!reg) {
      throw new NotFoundError(`Region with code "${regionCode}" not found`);
    }
    return new RegionWrapper(reg);
  }

  /**
   * Get all subdivisions in this division
   * @returns Array of SubdivisionWrapper
   */
  subdivisions(): SubdivisionWrapper[] {
    const divisionSubs = divisionToSubdivisionsMap.get(this._data.code) || [];
    return divisionSubs.map((s) => new SubdivisionWrapper(s));
  }

  /**
   * Get a subdivision by name or code
   * @param nameOrCode Name (any language) or code (any type) of the subdivision
   * @throws NotFoundError if not found
   */
  subdivision(nameOrCode: string): SubdivisionWrapper {
    // Try all lookup methods
    const subdivision =
      subdivisionCodeMap.get(nameOrCode) ||
      subdivisionHascMap.get(nameOrCode) ||
      subdivisionPcodeMap.get(nameOrCode) ||
      subdivisionNameFrMap.get(nameOrCode.toLowerCase()) ||
      subdivisionNameEnMap.get(nameOrCode.toLowerCase());

    if (subdivision && subdivision.division === this._data.nameFr) {
      return new SubdivisionWrapper(subdivision);
    }

    // If not found, look through the division's subdivisions (slower fallback)
    const divisionSubs = divisionToSubdivisionsMap.get(this._data.code) || [];
    const match = divisionSubs.find(
      (s) =>
        s.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        s.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        s.code === nameOrCode ||
        s.hasc === nameOrCode ||
        s.pcode === nameOrCode
    );

    if (match) {
      return new SubdivisionWrapper(match);
    }

    throw new NotFoundError(
      `Subdivision "${nameOrCode}" not found in division "${this._data.nameFr}"`
    );
  }

  /**
   * Get all districts in this division
   * @returns Array of DistrictWrapper
   */
  districts(): DistrictWrapper[] {
    const divisionDists = divisionToDistrictsMap.get(this._data.code) || [];
    return divisionDists.map((d) => new DistrictWrapper(d));
  }
}

class SubdivisionWrapper {
  private readonly _data: Subdivision;

  constructor(data: Subdivision) {
    this._data = data;
  }

  /** Get the subdivision code */
  get code(): string {
    return this._data.code;
  }

  /** Get the subdivision name (French, primary) */
  get name(): string {
    return this._data.nameFr;
  }

  /** Get the French name */
  get nameFr(): string {
    return this._data.nameFr;
  }

  /** Get the English name */
  get nameEn(): string {
    return this._data.nameEn;
  }

  /** Get the HASC code (optional) */
  get hasc(): string | undefined {
    return this._data.hasc;
  }

  /** Get the P-code (optional) */
  get pcode(): string | undefined {
    return this._data.pcode;
  }

  /** Get all data for the subdivision */
  get data(): Subdivision {
    return { ...this._data };
  }

  /**
   * Get name in specified language
   * @param language Language preference ('fr' or 'en')
   */
  getName(language: Language = "fr"): string {
    return language === "en" ? this._data.nameEn : this._data.nameFr;
  }

  /**
   * Get all codes for this subdivision
   */
  getAllCodes(): { code: string; hasc?: string; pcode?: string } {
    return {
      code: this._data.code,
      hasc: this._data.hasc,
      pcode: this._data.pcode,
    };
  }

  /**
   * Get the division this subdivision belongs to
   * @returns DivisionWrapper
   * @throws NotFoundError if not found
   */
  division(): DivisionWrapper {
    const divisionCode = subdivisionToDivisionMap.get(this._data.code);
    if (!divisionCode) {
      throw new NotFoundError(
        `Division for subdivision "${this._data.nameFr}" not found`
      );
    }
    const div = divisionCodeMap.get(divisionCode);
    if (!div) {
      throw new NotFoundError(`Division with code "${divisionCode}" not found`);
    }
    return new DivisionWrapper(div);
  }

  /**
   * Get the region this subdivision belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    return this.division().region();
  }

  /**
   * Get all districts in this subdivision
   * @returns Array of DistrictWrapper
   */
  districts(): DistrictWrapper[] {
    const subdivisionDists =
      subdivisionToDistrictsMap.get(this._data.code) || [];
    return subdivisionDists.map((d) => new DistrictWrapper(d));
  }

  /**
   * Get a district by name or code
   * @param nameOrCode Name (any language) or code (any type) of the district
   * @throws NotFoundError if not found
   */
  district(nameOrCode: string): DistrictWrapper {
    // Try all lookup methods
    const district =
      districtCodeMap.get(nameOrCode) ||
      districtHascMap.get(nameOrCode) ||
      districtPcodeMap.get(nameOrCode) ||
      districtNameFrMap.get(nameOrCode.toLowerCase()) ||
      districtNameEnMap.get(nameOrCode.toLowerCase());

    if (district && district.subdivision === this._data.nameFr) {
      return new DistrictWrapper(district);
    }

    // If not found, look through the subdivision's districts (slower fallback)
    const subdivisionDists =
      subdivisionToDistrictsMap.get(this._data.code) || [];
    const match = subdivisionDists.find(
      (d) =>
        d.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        d.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        d.code === nameOrCode ||
        d.hasc === nameOrCode ||
        d.pcode === nameOrCode
    );

    if (match) {
      return new DistrictWrapper(match);
    }

    throw new NotFoundError(
      `District "${nameOrCode}" not found in subdivision "${this._data.nameFr}"`
    );
  }
}

class DistrictWrapper {
  private readonly _data: District;

  constructor(data: District) {
    this._data = data;
  }

  /** Get the district code */
  get code(): string {
    return this._data.code;
  }

  /** Get the district name (French, primary) */
  get name(): string {
    return this._data.nameFr;
  }

  /** Get the French name */
  get nameFr(): string {
    return this._data.nameFr;
  }

  /** Get the English name */
  get nameEn(): string {
    return this._data.nameEn;
  }

  /** Get the HASC code (optional) */
  get hasc(): string | undefined {
    return this._data.hasc;
  }

  /** Get the P-code (optional) */
  get pcode(): string | undefined {
    return this._data.pcode;
  }

  /** Get all data for the district */
  get data(): District {
    return { ...this._data };
  }

  /**
   * Get name in specified language
   * @param language Language preference ('fr' or 'en')
   */
  getName(language: Language = "fr"): string {
    return language === "en" ? this._data.nameEn : this._data.nameFr;
  }

  /**
   * Get all codes for this district
   */
  getAllCodes(): { code: string; hasc?: string; pcode?: string } {
    return {
      code: this._data.code,
      hasc: this._data.hasc,
      pcode: this._data.pcode,
    };
  }

  /**
   * Get the subdivision this district belongs to
   * @returns SubdivisionWrapper
   * @throws NotFoundError if not found
   */
  subdivision(): SubdivisionWrapper {
    const subdivisionCode = districtToSubdivisionMap.get(this._data.code);
    if (!subdivisionCode) {
      throw new NotFoundError(
        `Subdivision for district "${this._data.nameFr}" not found`
      );
    }
    const sub = subdivisionCodeMap.get(subdivisionCode);
    if (!sub) {
      throw new NotFoundError(
        `Subdivision with code "${subdivisionCode}" not found`
      );
    }
    return new SubdivisionWrapper(sub);
  }

  /**
   * Get the division this district belongs to
   * @returns DivisionWrapper
   * @throws NotFoundError if not found
   */
  division(): DivisionWrapper {
    return this.subdivision().division();
  }

  /**
   * Get the region this district belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    return this.subdivision().region();
  }
}

// --- Enhanced Standalone Functions with Multi-Code Support ---

// Basic data access functions
export function getRegions(): Region[] {
  return [...regions];
}

export function getDivisions(): Division[] {
  return [...divisions];
}

export function getSubdivisions(): Subdivision[] {
  return [...subdivisions];
}

export function getDistricts(): District[] {
  return [...districts];
}

// Individual lookup functions (returning raw data) - support all code types
export function getRegionByCode(code: string): Region | undefined {
  return (
    regionCodeMap.get(code) ||
    regionHascMap.get(code) ||
    regionPcodeMap.get(code)
  );
}

export function getDivisionByCode(code: string): Division | undefined {
  return (
    divisionCodeMap.get(code) ||
    divisionHascMap.get(code) ||
    divisionPcodeMap.get(code)
  );
}

export function getSubdivisionByCode(code: string): Subdivision | undefined {
  return (
    subdivisionCodeMap.get(code) ||
    subdivisionHascMap.get(code) ||
    subdivisionPcodeMap.get(code)
  );
}

export function getDistrictByCode(code: string): District | undefined {
  return (
    districtCodeMap.get(code) ||
    districtHascMap.get(code) ||
    districtPcodeMap.get(code)
  );
}

// Wrapper factory functions - support all code types and languages
export function region(nameOrCode: string): RegionWrapper | undefined {
  const reg =
    regionCodeMap.get(nameOrCode) ||
    regionHascMap.get(nameOrCode) ||
    regionPcodeMap.get(nameOrCode) ||
    regionNameFrMap.get(nameOrCode.toLowerCase()) ||
    regionNameEnMap.get(nameOrCode.toLowerCase());
  return reg ? new RegionWrapper(reg) : undefined;
}

export function division(nameOrCode: string): DivisionWrapper | undefined {
  const div =
    divisionCodeMap.get(nameOrCode) ||
    divisionHascMap.get(nameOrCode) ||
    divisionPcodeMap.get(nameOrCode) ||
    divisionNameFrMap.get(nameOrCode.toLowerCase()) ||
    divisionNameEnMap.get(nameOrCode.toLowerCase());
  return div ? new DivisionWrapper(div) : undefined;
}

export function subdivision(
  nameOrCode: string
): SubdivisionWrapper | undefined {
  const sub =
    subdivisionCodeMap.get(nameOrCode) ||
    subdivisionHascMap.get(nameOrCode) ||
    subdivisionPcodeMap.get(nameOrCode) ||
    subdivisionNameFrMap.get(nameOrCode.toLowerCase()) ||
    subdivisionNameEnMap.get(nameOrCode.toLowerCase());
  return sub ? new SubdivisionWrapper(sub) : undefined;
}

export function district(nameOrCode: string): DistrictWrapper | undefined {
  const dist =
    districtCodeMap.get(nameOrCode) ||
    districtHascMap.get(nameOrCode) ||
    districtPcodeMap.get(nameOrCode) ||
    districtNameFrMap.get(nameOrCode.toLowerCase()) ||
    districtNameEnMap.get(nameOrCode.toLowerCase());
  return dist ? new DistrictWrapper(dist) : undefined;
}

// Hierarchical query functions - support all code types and languages
export function getDivisionsInRegion(regionNameOrCode: string): Division[] {
  const reg =
    regionCodeMap.get(regionNameOrCode) ||
    regionHascMap.get(regionNameOrCode) ||
    regionPcodeMap.get(regionNameOrCode) ||
    regionNameFrMap.get(regionNameOrCode.toLowerCase()) ||
    regionNameEnMap.get(regionNameOrCode.toLowerCase());
  if (!reg) return [];
  return regionToDivisionsMap.get(reg.code) || [];
}

export function getSubdivisionsInDivision(
  divisionNameOrCode: string
): Subdivision[] {
  const div =
    divisionCodeMap.get(divisionNameOrCode) ||
    divisionHascMap.get(divisionNameOrCode) ||
    divisionPcodeMap.get(divisionNameOrCode) ||
    divisionNameFrMap.get(divisionNameOrCode.toLowerCase()) ||
    divisionNameEnMap.get(divisionNameOrCode.toLowerCase());
  if (!div) return [];
  return divisionToSubdivisionsMap.get(div.code) || [];
}

export function getDistrictsInSubdivision(
  subdivisionNameOrCode: string
): District[] {
  const sub =
    subdivisionCodeMap.get(subdivisionNameOrCode) ||
    subdivisionHascMap.get(subdivisionNameOrCode) ||
    subdivisionPcodeMap.get(subdivisionNameOrCode) ||
    subdivisionNameFrMap.get(subdivisionNameOrCode.toLowerCase()) ||
    subdivisionNameEnMap.get(subdivisionNameOrCode.toLowerCase());
  if (!sub) return [];
  return subdivisionToDistrictsMap.get(sub.code) || [];
}

export function getSubdivisionsInRegion(
  regionNameOrCode: string
): Subdivision[] {
  const reg =
    regionCodeMap.get(regionNameOrCode) ||
    regionHascMap.get(regionNameOrCode) ||
    regionPcodeMap.get(regionNameOrCode) ||
    regionNameFrMap.get(regionNameOrCode.toLowerCase()) ||
    regionNameEnMap.get(regionNameOrCode.toLowerCase());
  if (!reg) return [];
  return regionToSubdivisionsMap.get(reg.code) || [];
}

export function getDistrictsInDivision(divisionNameOrCode: string): District[] {
  const div =
    divisionCodeMap.get(divisionNameOrCode) ||
    divisionHascMap.get(divisionNameOrCode) ||
    divisionPcodeMap.get(divisionNameOrCode) ||
    divisionNameFrMap.get(divisionNameOrCode.toLowerCase()) ||
    divisionNameEnMap.get(divisionNameOrCode.toLowerCase());
  if (!div) return [];
  return divisionToDistrictsMap.get(div.code) || [];
}

export function getDistrictsInRegion(regionNameOrCode: string): District[] {
  const reg =
    regionCodeMap.get(regionNameOrCode) ||
    regionHascMap.get(regionNameOrCode) ||
    regionPcodeMap.get(regionNameOrCode) ||
    regionNameFrMap.get(regionNameOrCode.toLowerCase()) ||
    regionNameEnMap.get(regionNameOrCode.toLowerCase());
  if (!reg) return [];
  return regionToDistrictsMap.get(reg.code) || [];
}

// Relationship query functions (returning raw data) - support all code types and languages
export function getRegionOfDivision(
  divisionNameOrCode: string
): Region | undefined {
  const div =
    divisionCodeMap.get(divisionNameOrCode) ||
    divisionHascMap.get(divisionNameOrCode) ||
    divisionPcodeMap.get(divisionNameOrCode) ||
    divisionNameFrMap.get(divisionNameOrCode.toLowerCase()) ||
    divisionNameEnMap.get(divisionNameOrCode.toLowerCase());
  if (!div) return undefined;
  const regionCode = divisionToRegionMap.get(div.code);
  return regionCode ? regionCodeMap.get(regionCode) : undefined;
}

export function getDivisionOfSubdivision(
  subdivisionNameOrCode: string
): Division | undefined {
  const sub =
    subdivisionCodeMap.get(subdivisionNameOrCode) ||
    subdivisionHascMap.get(subdivisionNameOrCode) ||
    subdivisionPcodeMap.get(subdivisionNameOrCode) ||
    subdivisionNameFrMap.get(subdivisionNameOrCode.toLowerCase()) ||
    subdivisionNameEnMap.get(subdivisionNameOrCode.toLowerCase());
  if (!sub) return undefined;
  const divisionCode = subdivisionToDivisionMap.get(sub.code);
  return divisionCode ? divisionCodeMap.get(divisionCode) : undefined;
}

export function getSubdivisionOfDistrict(
  districtNameOrCode: string
): Subdivision | undefined {
  const dist =
    districtCodeMap.get(districtNameOrCode) ||
    districtHascMap.get(districtNameOrCode) ||
    districtPcodeMap.get(districtNameOrCode) ||
    districtNameFrMap.get(districtNameOrCode.toLowerCase()) ||
    districtNameEnMap.get(districtNameOrCode.toLowerCase());
  if (!dist) return undefined;
  const subdivisionCode = districtToSubdivisionMap.get(dist.code);
  return subdivisionCode ? subdivisionCodeMap.get(subdivisionCode) : undefined;
}

export function getRegionOfSubdivision(
  subdivisionNameOrCode: string
): Region | undefined {
  const division = getDivisionOfSubdivision(subdivisionNameOrCode);
  return division ? getRegionOfDivision(division.code) : undefined;
}

export function getDivisionOfDistrict(
  districtNameOrCode: string
): Division | undefined {
  const subdivision = getSubdivisionOfDistrict(districtNameOrCode);
  return subdivision ? getDivisionOfSubdivision(subdivision.code) : undefined;
}

export function getRegionOfDistrict(
  districtNameOrCode: string
): Region | undefined {
  const subdivision = getSubdivisionOfDistrict(districtNameOrCode);
  return subdivision ? getRegionOfSubdivision(subdivision.code) : undefined;
}

// Enhanced search functions with language support
export function search(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  return searchFunction(query, options);
}

export function searchByType(
  query: string,
  type: "region" | "division" | "subdivision" | "district",
  limit = 10
): SearchResult[] {
  return searchByTypeFunction(query, type, limit);
}

/**
 * Main class for working with Cameroon administrative divisions
 */
export class CameroonLocations {
  static getRegions = getRegions;
  static getDivisions = getDivisions;
  static getSubdivisions = getSubdivisions;
  static getDistricts = getDistricts;
  static getRegionByCode = getRegionByCode;
  static getDivisionByCode = getDivisionByCode;
  static getSubdivisionByCode = getSubdivisionByCode;
  static getDistrictByCode = getDistrictByCode;
  static region = region;
  static division = division;
  static subdivision = subdivision;
  static district = district;
  static getDivisionsInRegion = getDivisionsInRegion;
  static getSubdivisionsInDivision = getSubdivisionsInDivision;
  static getDistrictsInSubdivision = getDistrictsInSubdivision;
  static getSubdivisionsInRegion = getSubdivisionsInRegion;
  static getDistrictsInDivision = getDistrictsInDivision;
  static getDistrictsInRegion = getDistrictsInRegion;
  static getRegionOfDivision = getRegionOfDivision;
  static getDivisionOfSubdivision = getDivisionOfSubdivision;
  static getSubdivisionOfDistrict = getSubdivisionOfDistrict;
  static getRegionOfSubdivision = getRegionOfSubdivision;
  static getDivisionOfDistrict = getDivisionOfDistrict;
  static getRegionOfDistrict = getRegionOfDistrict;
  static search = search;
  static searchByType = searchByType;
}

export {
  RegionWrapper,
  DivisionWrapper,
  SubdivisionWrapper,
  DistrictWrapper,
  NotFoundError,
};
export default CameroonLocations;
