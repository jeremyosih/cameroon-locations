/**
 * Raw Region data (as stored in data files)
 */
export interface RegionData {
  // Names (bilingual)
  nameFr: string; // French name (primary for Cameroon)
  nameEn: string; // English name

  // Codes (multiple systems)
  code: string; // Numeric code (01, 02, etc.)
  hasc?: string; // HASC code (CM.AD, CM.CE, etc.) - optional
  pcode?: string; // P-code (CMR001, CMR002, etc.) - optional
}

/**
 * Interface for Region with computed properties
 */
export interface Region extends RegionData {
  // Computed property for backward compatibility
  readonly name: string; // Returns nameFr
}

/**
 * Raw Division data (as stored in data files)
 */
export interface DivisionData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (multiple systems)
  code: string; // Alphanumeric code (AD01, CE07, etc.)
  hasc?: string; // HASC code (CM.AD.DJ, CM.CE.MF, etc.) - optional
  pcode?: string; // P-code (CMR001001, CMR002007, etc.) - optional

  // Parent relationships
  region: string; // Parent region (French name)
  regionCode: string; // Parent region code
}

/**
 * Interface for Division with computed properties
 */
export interface Division extends DivisionData {
  // Computed property for backward compatibility
  readonly name: string; // Returns nameFr
}

/**
 * Raw Subdivision data (as stored in data files)
 */
export interface SubdivisionData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (multiple systems)
  code: string; // Alphanumeric code (CE0701, etc.)
  hasc?: string; // HASC code - optional
  pcode?: string; // P-code - optional

  // Parent relationships
  division: string; // Parent division (French name)
  divisionCode: string; // Parent division code
}

/**
 * Interface for Subdivision with computed properties
 */
export interface Subdivision extends SubdivisionData {
  // Computed property for backward compatibility
  readonly name: string; // Returns nameFr
}

/**
 * Raw District data (as stored in data files)
 */
export interface DistrictData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (multiple systems)
  code: string; // Alphanumeric code
  hasc?: string; // HASC code - optional
  pcode?: string; // P-code - optional

  // Parent relationships
  subdivision: string; // Parent subdivision (French name)
  subdivisionCode: string; // Parent subdivision code
}

/**
 * Interface for District with computed properties
 */
export interface District extends DistrictData {
  // Computed property for backward compatibility
  readonly name: string; // Returns nameFr
}

/**
 * Search result interface
 */
export interface SearchResult {
  type: "region" | "division" | "subdivision" | "district";
  item: Region | Division | Subdivision | District;
}

/**
 * Available search types
 */
export type SearchType = "region" | "division" | "subdivision" | "district";

/**
 * Language options for bilingual support
 */
export type Language = "fr" | "en";

/**
 * Search options with language support
 */
export interface SearchOptions {
  limit?: number;
  types?: SearchType[];
  language?: Language | "both";
}

/**
 * Data version options
 */
export interface CameroonDivisionsOptions {
  dataVersion?: string;
  defaultLanguage?: Language;
}
