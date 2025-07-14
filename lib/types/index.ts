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
  // Computed property
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
  // Computed property
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
  // Computed property
  readonly name: string; // Returns nameFr
}

/**
 * Canton types in Cameroon's administrative system
 */
export type CantonType =
  | "city"
  | "rural"
  | "group"
  | "lamidat"
  | "sultanate"
  | "sector"
  | "chiefdom"
  | "canton";

/**
 * NeighborhoodOrVillage types in Cameroon's administrative system
 */
export type NeighborhoodOrVillageType = "neighborhood" | "village" | "locality";

/**
 * Population data structure
 */
export interface PopulationData {
  total: number;
  male: number;
  female: number;
}

/**
 * Raw Canton data (as stored in data files)
 */
export interface CantonData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (simple alphanumeric only)
  code: string; // Alphanumeric code

  // Administrative type
  type: CantonType;

  // Parent relationships
  subdivision: string; // Parent subdivision (French name)
  subdivisionCode: string; // Parent subdivision code
}

/**
 * Interface for Canton with computed properties
 */
export interface Canton extends CantonData {
  // Computed property
  readonly name: string; // Returns nameFr
}

/**
 * Raw NeighborhoodOrVillage data (as stored in data files)
 */
export interface NeighborhoodOrVillageData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (simple alphanumeric only)
  code: string; // Alphanumeric code

  // Administrative type
  type: NeighborhoodOrVillageType;

  // Optional population data
  population?: PopulationData;

  // Parent relationships
  canton: string; // Parent canton (French name)
  cantonCode: string; // Parent canton code
}

/**
 * Interface for NeighborhoodOrVillage with computed properties
 */
export interface NeighborhoodOrVillage extends NeighborhoodOrVillageData {
  // Computed property
  readonly name: string; // Returns nameFr
}

/**
 * Raw Block data (as stored in data files)
 */
export interface BlockData {
  // Names (bilingual)
  nameFr: string; // French name (primary)
  nameEn: string; // English name

  // Codes (simple alphanumeric only)
  code: string; // Alphanumeric code

  // Parent relationships
  neighborhoodOrVillage: string; // Parent neighborhood or village (French name)
  neighborhoodOrVillageCode: string; // Parent neighborhood or village code
}

/**
 * Interface for Block with computed properties
 */
export interface Block extends BlockData {
  // Computed property
  readonly name: string; // Returns nameFr
}

/**
 * Search result interface
 */
export interface SearchResult {
  type:
    | "region"
    | "division"
    | "subdivision"
    | "canton"
    | "neighborhoodOrVillage"
    | "block";
  item:
    | Region
    | Division
    | Subdivision
    | Canton
    | NeighborhoodOrVillage
    | Block;
}

/**
 * Available search types
 */
export type SearchType =
  | "region"
  | "division"
  | "subdivision"
  | "canton"
  | "neighborhoodOrVillage"
  | "block";

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
