import type {
  Region,
  Division,
  Subdivision,
  Canton,
  NeighborhoodOrVillage,
  Block,
  CantonType,
  SearchResult,
  Language,
  SearchOptions,
} from "./types";
import { regions as regionsData } from "./data/regions";
import { divisions as divisionsData } from "./data/divisions";
import { subdivisions as subdivisionsData } from "./data/subdivisions";
import { cantons as cantonsData } from "./data/cantons";
import { neighborhoodsOrVillages as neighborhoodsOrVillagesData } from "./data/neighborhoodsOrVillages";
import { blocks as blocksData } from "./data/blocks";
import {
  search as searchFunction,
  searchByType as searchByTypeFunction,
} from "./utils/search";

// --- Utility Functions ---

/**
 * Adds computed name property to raw data objects
 */
function addComputedName<T extends { nameFr: string }>(
  data: T
): T & { readonly name: string } {
  return Object.defineProperty(data, "name", {
    get() {
      return this.nameFr;
    },
    enumerable: true,
    configurable: false,
  }) as T & { readonly name: string };
}

/**
 * Process raw data arrays to add computed properties
 */
const regions: Region[] = regionsData.map(addComputedName);
const divisions: Division[] = divisionsData.map(addComputedName);
const subdivisions: Subdivision[] = subdivisionsData.map(addComputedName);
const cantons: Canton[] = cantonsData.map(addComputedName);
const neighborhoodsOrVillages: NeighborhoodOrVillage[] =
  neighborhoodsOrVillagesData.map(addComputedName);
const blocks: Block[] = blocksData.map(addComputedName);

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

// Canton lookup maps
const cantonCodeMap: Map<string, Canton> = new Map();
const cantonNameFrMap: Map<string, Canton> = new Map();
const cantonNameEnMap: Map<string, Canton> = new Map();
const cantonTypeMap: Map<CantonType, Canton[]> = new Map();

// NeighborhoodOrVillage lookup maps
const neighborhoodOrVillageCodeMap: Map<string, NeighborhoodOrVillage> =
  new Map();
const neighborhoodOrVillageNameFrMap: Map<string, NeighborhoodOrVillage> =
  new Map();
const neighborhoodOrVillageNameEnMap: Map<string, NeighborhoodOrVillage> =
  new Map();

// Block lookup maps
const blockCodeMap: Map<string, Block> = new Map();
const blockNameFrMap: Map<string, Block> = new Map();
const blockNameEnMap: Map<string, Block> = new Map();

// --- Relationship Maps ---
const regionToDivisionsMap: Map<string, Division[]> = new Map();
const divisionToSubdivisionsMap: Map<string, Subdivision[]> = new Map();
const subdivisionToCantonsMap: Map<string, Canton[]> = new Map();
const cantonToNeighborhoodOrVillagesMap: Map<string, NeighborhoodOrVillage[]> =
  new Map();
const neighborhoodOrVillageToBlocksMap: Map<string, Block[]> = new Map();

// Cross-level relationship maps
const regionToSubdivisionsMap: Map<string, Subdivision[]> = new Map();
const regionToCantonsMap: Map<string, Canton[]> = new Map();
const divisionToCantonsMap: Map<string, Canton[]> = new Map();

// Parent lookup maps
const subdivisionToDivisionMap: Map<string, string> = new Map();
const divisionToRegionMap: Map<string, string> = new Map();
const cantonToSubdivisionMap: Map<string, string> = new Map();
const neighborhoodOrVillageToCantonMap: Map<string, string> = new Map();
const blockToNeighborhoodOrVillageMap: Map<string, string> = new Map();

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

cantons.forEach((canton) => {
  // Code-based lookups
  cantonCodeMap.set(canton.code, canton);

  // Language-based lookups
  cantonNameFrMap.set(canton.nameFr.toLowerCase(), canton);
  cantonNameEnMap.set(canton.nameEn.toLowerCase(), canton);

  // Type-based lookups
  const typeCantons = cantonTypeMap.get(canton.type) || [];
  typeCantons.push(canton);
  cantonTypeMap.set(canton.type, typeCantons);

  // Relationship mapping
  const subdivisionCode = subdivisions.find(
    (s) => s.nameFr === canton.subdivision
  )?.code;
  if (subdivisionCode) {
    cantonToSubdivisionMap.set(canton.code, subdivisionCode);
    cantonToSubdivisionMap.set(canton.nameFr, subdivisionCode);

    const subdivisionCantons =
      subdivisionToCantonsMap.get(subdivisionCode) || [];
    subdivisionCantons.push(canton);
    subdivisionToCantonsMap.set(subdivisionCode, subdivisionCantons);

    const divisionCode = subdivisionToDivisionMap.get(subdivisionCode);
    if (divisionCode) {
      const divisionCantons = divisionToCantonsMap.get(divisionCode) || [];
      divisionCantons.push(canton);
      divisionToCantonsMap.set(divisionCode, divisionCantons);

      const regionCode = divisionToRegionMap.get(divisionCode);
      if (regionCode) {
        const regionCantons = regionToCantonsMap.get(regionCode) || [];
        regionCantons.push(canton);
        regionToCantonsMap.set(regionCode, regionCantons);
      }
    }
  }
});

neighborhoodsOrVillages.forEach((neighborhoodOrVillage) => {
  // Code-based lookups
  neighborhoodOrVillageCodeMap.set(
    neighborhoodOrVillage.code,
    neighborhoodOrVillage
  );

  // Language-based lookups
  neighborhoodOrVillageNameFrMap.set(
    neighborhoodOrVillage.nameFr.toLowerCase(),
    neighborhoodOrVillage
  );
  neighborhoodOrVillageNameEnMap.set(
    neighborhoodOrVillage.nameEn.toLowerCase(),
    neighborhoodOrVillage
  );

  // Relationship mapping
  const cantonCode = cantons.find(
    (c) => c.nameFr === neighborhoodOrVillage.canton
  )?.code;
  if (cantonCode) {
    neighborhoodOrVillageToCantonMap.set(
      neighborhoodOrVillage.code,
      cantonCode
    );
    neighborhoodOrVillageToCantonMap.set(
      neighborhoodOrVillage.nameFr,
      cantonCode
    );

    const cantonNeighborhoodOrVillages =
      cantonToNeighborhoodOrVillagesMap.get(cantonCode) || [];
    cantonNeighborhoodOrVillages.push(neighborhoodOrVillage);
    cantonToNeighborhoodOrVillagesMap.set(
      cantonCode,
      cantonNeighborhoodOrVillages
    );
  }
});

blocks.forEach((block) => {
  // Code-based lookups
  blockCodeMap.set(block.code, block);

  // Language-based lookups
  blockNameFrMap.set(block.nameFr.toLowerCase(), block);
  blockNameEnMap.set(block.nameEn.toLowerCase(), block);

  // Relationship mapping
  const neighborhoodOrVillageCode = neighborhoodsOrVillages.find(
    (la) => la.nameFr === block.localArea
  )?.code;
  if (neighborhoodOrVillageCode) {
    blockToNeighborhoodOrVillageMap.set(block.code, neighborhoodOrVillageCode);
    blockToNeighborhoodOrVillageMap.set(
      block.nameFr,
      neighborhoodOrVillageCode
    );

    const neighborhoodOrVillageBlocks =
      neighborhoodOrVillageToBlocksMap.get(neighborhoodOrVillageCode) || [];
    neighborhoodOrVillageBlocks.push(block);
    neighborhoodOrVillageToBlocksMap.set(
      neighborhoodOrVillageCode,
      neighborhoodOrVillageBlocks
    );
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
   * Get all cantons in this region
   * @returns Array of CantonWrapper
   */
  cantons(): CantonWrapper[] {
    const regionCantons = regionToCantonsMap.get(this._data.code) || [];
    return regionCantons.map((c) => new CantonWrapper(c));
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
   * Get all cantons in this division
   * @returns Array of CantonWrapper
   */
  cantons(): CantonWrapper[] {
    const divisionCantons = divisionToCantonsMap.get(this._data.code) || [];
    return divisionCantons.map((c) => new CantonWrapper(c));
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
   * Get all cantons in this subdivision
   * @returns Array of CantonWrapper
   */
  cantons(): CantonWrapper[] {
    const subdivisionCantons =
      subdivisionToCantonsMap.get(this._data.code) || [];
    return subdivisionCantons.map((c) => new CantonWrapper(c));
  }

  /**
   * Get a canton by name or code
   * @param nameOrCode Name (any language) or code of the canton
   * @throws NotFoundError if not found
   */
  canton(nameOrCode: string): CantonWrapper {
    // Try all lookup methods
    const canton =
      cantonCodeMap.get(nameOrCode) ||
      cantonNameFrMap.get(nameOrCode.toLowerCase()) ||
      cantonNameEnMap.get(nameOrCode.toLowerCase());

    if (canton && canton.subdivision === this._data.nameFr) {
      return new CantonWrapper(canton);
    }

    // If not found, look through the subdivision's cantons (slower fallback)
    const subdivisionCantons =
      subdivisionToCantonsMap.get(this._data.code) || [];
    const match = subdivisionCantons.find(
      (c) =>
        c.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        c.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        c.code === nameOrCode
    );

    if (match) {
      return new CantonWrapper(match);
    }

    throw new NotFoundError(
      `Canton "${nameOrCode}" not found in subdivision "${this._data.nameFr}"`
    );
  }
}

class CantonWrapper {
  private readonly _data: Canton;

  constructor(data: Canton) {
    this._data = data;
  }

  /** Get the canton code */
  get code(): string {
    return this._data.code;
  }

  /** Get the canton name (French, primary) */
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

  /** Get the canton type */
  get type(): CantonType {
    return this._data.type;
  }

  /** Get all data for the canton */
  get data(): Canton {
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
   * Get all codes for this canton
   */
  getAllCodes(): { code: string } {
    return {
      code: this._data.code,
    };
  }

  /**
   * Get the subdivision this canton belongs to
   * @returns SubdivisionWrapper
   * @throws NotFoundError if not found
   */
  subdivision(): SubdivisionWrapper {
    const subdivisionCode = cantonToSubdivisionMap.get(this._data.code);
    if (!subdivisionCode) {
      throw new NotFoundError(
        `Subdivision for canton "${this._data.nameFr}" not found`
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
   * Get the division this canton belongs to
   * @returns DivisionWrapper
   * @throws NotFoundError if not found
   */
  division(): DivisionWrapper {
    return this.subdivision().division();
  }

  /**
   * Get the region this canton belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    return this.subdivision().region();
  }

  /**
   * Get all local areas in this canton
   * @returns Array of NeighborhoodOrVillageWrapper
   */
  neighborhoodsOrVillages(): NeighborhoodOrVillageWrapper[] {
    const cantonNeighborhoodOrVillages =
      cantonToNeighborhoodOrVillagesMap.get(this._data.code) || [];
    return cantonNeighborhoodOrVillages.map(
      (la) => new NeighborhoodOrVillageWrapper(la)
    );
  }

  /**
   * Get a local area by name or code
   * @param nameOrCode Name (any language) or code of the local area
   * @throws NotFoundError if not found
   */
  neighborhoodOrVillage(nameOrCode: string): NeighborhoodOrVillageWrapper {
    // Try all lookup methods
    const neighborhoodOrVillage =
      neighborhoodOrVillageCodeMap.get(nameOrCode) ||
      neighborhoodOrVillageNameFrMap.get(nameOrCode.toLowerCase()) ||
      neighborhoodOrVillageNameEnMap.get(nameOrCode.toLowerCase());

    if (
      neighborhoodOrVillage &&
      neighborhoodOrVillage.canton === this._data.nameFr
    ) {
      return new NeighborhoodOrVillageWrapper(neighborhoodOrVillage);
    }

    // If not found, look through the canton's local areas (slower fallback)
    const cantonNeighborhoodOrVillages =
      cantonToNeighborhoodOrVillagesMap.get(this._data.code) || [];
    const match = cantonNeighborhoodOrVillages.find(
      (la) =>
        la.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        la.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        la.code === nameOrCode
    );

    if (match) {
      return new NeighborhoodOrVillageWrapper(match);
    }

    throw new NotFoundError(
      `Local area "${nameOrCode}" not found in canton "${this._data.nameFr}"`
    );
  }

  // Backward compatibility methods
  localAreas(): NeighborhoodOrVillageWrapper[] {
    return this.neighborhoodsOrVillages();
  }

  localArea(nameOrCode: string): NeighborhoodOrVillageWrapper {
    return this.neighborhoodOrVillage(nameOrCode);
  }
}

class NeighborhoodOrVillageWrapper {
  private readonly _data: NeighborhoodOrVillage;

  constructor(data: NeighborhoodOrVillage) {
    this._data = data;
  }

  /** Get the local area code */
  get code(): string {
    return this._data.code;
  }

  /** Get the local area name (French, primary) */
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

  /** Get the local area type */
  get type(): string {
    return this._data.type;
  }

  /** Get the population data (if available) */
  get population():
    | { total: number; male: number; female: number }
    | undefined {
    return this._data.population;
  }

  /** Get all data for the local area */
  get data(): NeighborhoodOrVillage {
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
   * Get all codes for this local area
   */
  getAllCodes(): { code: string } {
    return {
      code: this._data.code,
    };
  }

  /**
   * Get the canton this local area belongs to
   * @returns CantonWrapper
   * @throws NotFoundError if not found
   */
  canton(): CantonWrapper {
    const cantonCode = neighborhoodOrVillageToCantonMap.get(this._data.code);
    if (!cantonCode) {
      throw new NotFoundError(
        `Canton for local area "${this._data.nameFr}" not found`
      );
    }
    const cant = cantonCodeMap.get(cantonCode);
    if (!cant) {
      throw new NotFoundError(`Canton with code "${cantonCode}" not found`);
    }
    return new CantonWrapper(cant);
  }

  /**
   * Get the subdivision this local area belongs to
   * @returns SubdivisionWrapper
   * @throws NotFoundError if not found
   */
  subdivision(): SubdivisionWrapper {
    return this.canton().subdivision();
  }

  /**
   * Get the division this local area belongs to
   * @returns DivisionWrapper
   * @throws NotFoundError if not found
   */
  division(): DivisionWrapper {
    return this.canton().division();
  }

  /**
   * Get the region this local area belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    return this.canton().region();
  }

  /**
   * Get all blocks in this local area
   * @returns Array of BlockWrapper
   */
  blocks(): BlockWrapper[] {
    const neighborhoodOrVillageBlocks =
      neighborhoodOrVillageToBlocksMap.get(this._data.code) || [];
    return neighborhoodOrVillageBlocks.map((b) => new BlockWrapper(b));
  }

  /**
   * Get a block by name or code
   * @param nameOrCode Name (any language) or code of the block
   * @throws NotFoundError if not found
   */
  block(nameOrCode: string): BlockWrapper {
    // Try all lookup methods
    const block =
      blockCodeMap.get(nameOrCode) ||
      blockNameFrMap.get(nameOrCode.toLowerCase()) ||
      blockNameEnMap.get(nameOrCode.toLowerCase());

    if (block && block.localArea === this._data.nameFr) {
      return new BlockWrapper(block);
    }

    // If not found, look through the local area's blocks (slower fallback)
    const neighborhoodOrVillageBlocks =
      neighborhoodOrVillageToBlocksMap.get(this._data.code) || [];
    const match = neighborhoodOrVillageBlocks.find(
      (b) =>
        b.nameFr.toLowerCase() === nameOrCode.toLowerCase() ||
        b.nameEn.toLowerCase() === nameOrCode.toLowerCase() ||
        b.code === nameOrCode
    );

    if (match) {
      return new BlockWrapper(match);
    }

    throw new NotFoundError(
      `Block "${nameOrCode}" not found in local area "${this._data.nameFr}"`
    );
  }
}

class BlockWrapper {
  private readonly _data: Block;

  constructor(data: Block) {
    this._data = data;
  }

  /** Get the block code */
  get code(): string {
    return this._data.code;
  }

  /** Get the block name (French, primary) */
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

  /** Get all data for the block */
  get data(): Block {
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
   * Get all codes for this block
   */
  getAllCodes(): { code: string } {
    return {
      code: this._data.code,
    };
  }

  /**
   * Get the local area this block belongs to
   * @returns NeighborhoodOrVillageWrapper
   * @throws NotFoundError if not found
   */
  neighborhoodOrVillage(): NeighborhoodOrVillageWrapper {
    const neighborhoodOrVillageCode = blockToNeighborhoodOrVillageMap.get(
      this._data.code
    );
    if (!neighborhoodOrVillageCode) {
      throw new NotFoundError(
        `Local area for block "${this._data.nameFr}" not found`
      );
    }
    const la = neighborhoodOrVillageCodeMap.get(neighborhoodOrVillageCode);
    if (!la) {
      throw new NotFoundError(
        `Local area with code "${neighborhoodOrVillageCode}" not found`
      );
    }
    return new NeighborhoodOrVillageWrapper(la);
  }

  /**
   * Get the canton this block belongs to
   * @returns CantonWrapper
   * @throws NotFoundError if not found
   */
  canton(): CantonWrapper {
    return this.neighborhoodOrVillage().canton();
  }

  /**
   * Get the subdivision this block belongs to
   * @returns SubdivisionWrapper
   * @throws NotFoundError if not found
   */
  subdivision(): SubdivisionWrapper {
    return this.neighborhoodOrVillage().subdivision();
  }

  /**
   * Get the division this block belongs to
   * @returns DivisionWrapper
   * @throws NotFoundError if not found
   */
  division(): DivisionWrapper {
    return this.neighborhoodOrVillage().division();
  }

  /**
   * Get the region this block belongs to
   * @returns RegionWrapper
   * @throws NotFoundError if not found
   */
  region(): RegionWrapper {
    return this.neighborhoodOrVillage().region();
  }

  // Backward compatibility method
  localArea(): NeighborhoodOrVillageWrapper {
    return this.neighborhoodOrVillage();
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

export function getCantons(): Canton[] {
  return [...cantons];
}

export function getNeighborhoodOrVillages(): NeighborhoodOrVillage[] {
  return [...neighborhoodsOrVillages];
}

export function getBlocks(): Block[] {
  return [...blocks];
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

export function getCantonByCode(code: string): Canton | undefined {
  return cantonCodeMap.get(code);
}

export function getNeighborhoodOrVillageByCode(
  code: string
): NeighborhoodOrVillage | undefined {
  return neighborhoodOrVillageCodeMap.get(code);
}

export function getBlockByCode(code: string): Block | undefined {
  return blockCodeMap.get(code);
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

export function canton(nameOrCode: string): CantonWrapper | undefined {
  const cant =
    cantonCodeMap.get(nameOrCode) ||
    cantonNameFrMap.get(nameOrCode.toLowerCase()) ||
    cantonNameEnMap.get(nameOrCode.toLowerCase());
  return cant ? new CantonWrapper(cant) : undefined;
}

export function neighborhoodOrVillage(
  nameOrCode: string
): NeighborhoodOrVillageWrapper | undefined {
  const la =
    neighborhoodOrVillageCodeMap.get(nameOrCode) ||
    neighborhoodOrVillageNameFrMap.get(nameOrCode.toLowerCase()) ||
    neighborhoodOrVillageNameEnMap.get(nameOrCode.toLowerCase());
  return la ? new NeighborhoodOrVillageWrapper(la) : undefined;
}

export function block(nameOrCode: string): BlockWrapper | undefined {
  const bl =
    blockCodeMap.get(nameOrCode) ||
    blockNameFrMap.get(nameOrCode.toLowerCase()) ||
    blockNameEnMap.get(nameOrCode.toLowerCase());
  return bl ? new BlockWrapper(bl) : undefined;
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

export function getCantonsInSubdivision(
  subdivisionNameOrCode: string
): Canton[] {
  const sub =
    subdivisionCodeMap.get(subdivisionNameOrCode) ||
    subdivisionHascMap.get(subdivisionNameOrCode) ||
    subdivisionPcodeMap.get(subdivisionNameOrCode) ||
    subdivisionNameFrMap.get(subdivisionNameOrCode.toLowerCase()) ||
    subdivisionNameEnMap.get(subdivisionNameOrCode.toLowerCase());
  if (!sub) return [];
  return subdivisionToCantonsMap.get(sub.code) || [];
}

export function getNeighborhoodOrVillagesInCanton(
  cantonNameOrCode: string
): NeighborhoodOrVillage[] {
  const cant =
    cantonCodeMap.get(cantonNameOrCode) ||
    cantonNameFrMap.get(cantonNameOrCode.toLowerCase()) ||
    cantonNameEnMap.get(cantonNameOrCode.toLowerCase());
  if (!cant) return [];
  return cantonToNeighborhoodOrVillagesMap.get(cant.code) || [];
}

export function getBlocksInNeighborhoodOrVillage(
  neighborhoodOrVillageNameOrCode: string
): Block[] {
  const la =
    neighborhoodOrVillageCodeMap.get(neighborhoodOrVillageNameOrCode) ||
    neighborhoodOrVillageNameFrMap.get(
      neighborhoodOrVillageNameOrCode.toLowerCase()
    ) ||
    neighborhoodOrVillageNameEnMap.get(
      neighborhoodOrVillageNameOrCode.toLowerCase()
    );
  if (!la) return [];
  return neighborhoodOrVillageToBlocksMap.get(la.code) || [];
}

// Canton type filtering functions
export function getCantonsByType(type: CantonType): Canton[] {
  return cantonTypeMap.get(type) || [];
}

export function getCityCantons(): Canton[] {
  return getCantonsByType("city");
}

export function getRuralCantons(): Canton[] {
  return getCantonsByType("rural");
}

export function getTraditionalCantons(): Canton[] {
  return [
    ...getCantonsByType("lamidat"),
    ...getCantonsByType("sultanate"),
    ...getCantonsByType("chiefdom"),
  ];
}

// NeighborhoodOrVillage with population data
export function getNeighborhoodOrVillagesWithPopulation(): NeighborhoodOrVillage[] {
  return neighborhoodsOrVillages.filter((la) => la.population !== undefined);
}

// Cross-level relationship functions
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

export function getCantonsInDivision(divisionNameOrCode: string): Canton[] {
  const div =
    divisionCodeMap.get(divisionNameOrCode) ||
    divisionHascMap.get(divisionNameOrCode) ||
    divisionPcodeMap.get(divisionNameOrCode) ||
    divisionNameFrMap.get(divisionNameOrCode.toLowerCase()) ||
    divisionNameEnMap.get(divisionNameOrCode.toLowerCase());
  if (!div) return [];
  return divisionToCantonsMap.get(div.code) || [];
}

export function getCantonsInRegion(regionNameOrCode: string): Canton[] {
  const reg =
    regionCodeMap.get(regionNameOrCode) ||
    regionHascMap.get(regionNameOrCode) ||
    regionPcodeMap.get(regionNameOrCode) ||
    regionNameFrMap.get(regionNameOrCode.toLowerCase()) ||
    regionNameEnMap.get(regionNameOrCode.toLowerCase());
  if (!reg) return [];
  return regionToCantonsMap.get(reg.code) || [];
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

export function getSubdivisionOfCanton(
  cantonNameOrCode: string
): Subdivision | undefined {
  const cant =
    cantonCodeMap.get(cantonNameOrCode) ||
    cantonNameFrMap.get(cantonNameOrCode.toLowerCase()) ||
    cantonNameEnMap.get(cantonNameOrCode.toLowerCase());
  if (!cant) return undefined;
  const subdivisionCode = cantonToSubdivisionMap.get(cant.code);
  return subdivisionCode ? subdivisionCodeMap.get(subdivisionCode) : undefined;
}

export function getCantonOfNeighborhoodOrVillage(
  neighborhoodOrVillageNameOrCode: string
): Canton | undefined {
  const la =
    neighborhoodOrVillageCodeMap.get(neighborhoodOrVillageNameOrCode) ||
    neighborhoodOrVillageNameFrMap.get(
      neighborhoodOrVillageNameOrCode.toLowerCase()
    ) ||
    neighborhoodOrVillageNameEnMap.get(
      neighborhoodOrVillageNameOrCode.toLowerCase()
    );
  if (!la) return undefined;
  const cantonCode = neighborhoodOrVillageToCantonMap.get(la.code);
  return cantonCode ? cantonCodeMap.get(cantonCode) : undefined;
}

export function getNeighborhoodOrVillageOfBlock(
  blockNameOrCode: string
): NeighborhoodOrVillage | undefined {
  const bl =
    blockCodeMap.get(blockNameOrCode) ||
    blockNameFrMap.get(blockNameOrCode.toLowerCase()) ||
    blockNameEnMap.get(blockNameOrCode.toLowerCase());
  if (!bl) return undefined;
  const neighborhoodOrVillageCode = blockToNeighborhoodOrVillageMap.get(
    bl.code
  );
  return neighborhoodOrVillageCode
    ? neighborhoodOrVillageCodeMap.get(neighborhoodOrVillageCode)
    : undefined;
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
  type:
    | "region"
    | "division"
    | "subdivision"
    | "canton"
    | "neighborhoodOrVillage"
    | "localArea"
    | "block",
  limit = 10
): SearchResult[] {
  // Map localArea to neighborhoodOrVillage for backward compatibility
  const actualType = type === "localArea" ? "neighborhoodOrVillage" : type;
  const results = searchByTypeFunction(query, actualType as any, limit);

  // Map results back to the original type for backward compatibility
  if (type === "localArea") {
    return results.map((result) => ({
      ...result,
      type: "localArea" as const,
    }));
  }

  return results;
}

// === Backward Compatibility Exports ===

/**
 * Backward compatibility alias for getNeighborhoodOrVillages
 */
export const getLocalAreas = getNeighborhoodOrVillages;

/**
 * Backward compatibility alias for getNeighborhoodOrVillageByCode
 */
export const getLocalAreaByCode = getNeighborhoodOrVillageByCode;

/**
 * Backward compatibility alias for neighborhoodOrVillage
 */
export const localArea = neighborhoodOrVillage;

/**
 * Backward compatibility alias for getNeighborhoodOrVillagesInCanton
 */
export const getLocalAreasInCanton = getNeighborhoodOrVillagesInCanton;

/**
 * Backward compatibility alias for getBlocksInNeighborhoodOrVillage
 */
export const getBlocksInLocalArea = getBlocksInNeighborhoodOrVillage;

/**
 * Backward compatibility alias for getNeighborhoodOrVillagesWithPopulation
 */
export const getLocalAreasWithPopulation =
  getNeighborhoodOrVillagesWithPopulation;

/**
 * Backward compatibility alias for getCantonOfNeighborhoodOrVillage
 */
export const getCantonOfLocalArea = getCantonOfNeighborhoodOrVillage;

/**
 * Backward compatibility alias for getNeighborhoodOrVillageOfBlock
 */
export const getLocalAreaOfBlock = getNeighborhoodOrVillageOfBlock;

/**
 * Main class for working with Cameroon administrative divisions
 */
export class CameroonLocations {
  static getRegions = getRegions;
  static getDivisions = getDivisions;
  static getSubdivisions = getSubdivisions;
  static getCantons = getCantons;
  static getNeighborhoodOrVillages = getNeighborhoodOrVillages;
  static getLocalAreas = getLocalAreas;
  static getBlocks = getBlocks;
  static getRegionByCode = getRegionByCode;
  static getDivisionByCode = getDivisionByCode;
  static getSubdivisionByCode = getSubdivisionByCode;
  static getCantonByCode = getCantonByCode;
  static getNeighborhoodOrVillageByCode = getNeighborhoodOrVillageByCode;
  static getBlockByCode = getBlockByCode;
  static region = region;
  static division = division;
  static subdivision = subdivision;
  static canton = canton;
  static neighborhoodOrVillage = neighborhoodOrVillage;
  static block = block;
  static getDivisionsInRegion = getDivisionsInRegion;
  static getSubdivisionsInDivision = getSubdivisionsInDivision;
  static getCantonsInSubdivision = getCantonsInSubdivision;
  static getNeighborhoodOrVillagesInCanton = getNeighborhoodOrVillagesInCanton;
  static getBlocksInNeighborhoodOrVillage = getBlocksInNeighborhoodOrVillage;
  static getCantonsByType = getCantonsByType;
  static getCityCantons = getCityCantons;
  static getRuralCantons = getRuralCantons;
  static getTraditionalCantons = getTraditionalCantons;
  static getNeighborhoodOrVillagesWithPopulation =
    getNeighborhoodOrVillagesWithPopulation;
  static getSubdivisionsInRegion = getSubdivisionsInRegion;
  static getCantonsInDivision = getCantonsInDivision;
  static getCantonsInRegion = getCantonsInRegion;
  static getRegionOfDivision = getRegionOfDivision;
  static getDivisionOfSubdivision = getDivisionOfSubdivision;
  static getSubdivisionOfCanton = getSubdivisionOfCanton;
  static getCantonOfNeighborhoodOrVillage = getCantonOfNeighborhoodOrVillage;
  static getNeighborhoodOrVillageOfBlock = getNeighborhoodOrVillageOfBlock;
  static search = search;
  static searchByType = searchByType;
}

// Export error classes
export { NotFoundError };

// Export wrapper classes
export {
  RegionWrapper,
  DivisionWrapper,
  SubdivisionWrapper,
  CantonWrapper,
  NeighborhoodOrVillageWrapper,
  BlockWrapper,
};
