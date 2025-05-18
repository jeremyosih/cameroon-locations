/**
 * Interface for County data
 */
export interface County {
  code: string;
  name: string;
}

/**
 * Interface for SubCounty data
 */
export interface SubCounty {
  code: string;
  name: string;
  county: string;
}

/**
 * Interface for Constituency data
 */
export interface Constituency {
  code: string;
  name: string;
  county: County;
}

/**
 * Interface for Ward data
 */
export interface Ward {
  code: string;
  name: string;
  constituencyCode: string;
}

/**
 * Search result interface
 */
export interface SearchResult {
  type: "county" | "constituency" | "ward" | "sub-county";
  item: County | Constituency | Ward | SubCounty;
}

/**
 * Data version options
 */
export interface KenyaDivisionsOptions {
  dataVersion?: string;
}
