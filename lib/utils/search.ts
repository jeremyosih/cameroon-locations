import Fuse from "fuse.js";
import type { SearchResult } from "../types";
import { counties, constituencies, wards } from "../data";
import { subCounties } from "../data/sub-counties";
import { areas } from "../data/area";
import { localities } from "../data/locality";

/**
 * Configuration for Fuse.js fuzzy search
 */
const countySearchOptions = {
  keys: ["name", "code"],
  threshold: 0.3,
  includeScore: true,
};

const constituencySearchOptions = {
  keys: ["name", "code", "county.code", "county.name"],
  threshold: 0.3,
  includeScore: true,
};

const wardSearchOptions = {
  keys: ["name", "code", "constituency"],
  threshold: 0.3,
  includeScore: true,
};

const subCountySearchOptions = {
  keys: ["name", "code", "county"],
  threshold: 0.3,
  includeScore: true,
};

const localitySearchOptions = {
  keys: ["name", "county"],
  threshold: 0.3,
  includeScore: true,
};

const areaSearchOptions = {
  keys: ["name", "locality", "county"],
  threshold: 0.3,
  includeScore: true,
};

/**
 * Create Fuse instances for each data type
 */
const countyFuse = new Fuse(counties, countySearchOptions);
const constituencyFuse = new Fuse(constituencies, constituencySearchOptions);
const wardFuse = new Fuse(wards, wardSearchOptions);
const subCountyFuse = new Fuse(subCounties, subCountySearchOptions);
const localityFuse = new Fuse(localities, localitySearchOptions);
const areaFuse = new Fuse(areas, areaSearchOptions);

/**
 * Search across all levels of administrative divisions
 * @param query Search query string
 * @param limit Maximum number of results (optional, default: 10)
 * @returns Array of search results
 */
export function search(query: string, limit = 10): SearchResult[] {
  // Don't perform search if query is too short
  if (!query || query.length < 2) {
    return [];
  }

  const countyResults = countyFuse.search(query).map((result) => ({
    type: "county" as const,
    item: result.item,
  }));

  const constituencyResults = constituencyFuse.search(query).map((result) => ({
    type: "constituency" as const,
    item: result.item,
  }));

  const wardResults = wardFuse.search(query).map((result) => ({
    type: "ward" as const,
    item: result.item,
  }));

  const subCountyResults = subCountyFuse.search(query).map((result) => ({
    type: "sub-county" as const,
    item: result.item,
  }));

  const localityResults = localityFuse.search(query).map((result) => ({
    type: "locality" as const,
    item: result.item,
  }));

  const areaResults = areaFuse.search(query).map((result) => ({
    type: "area" as const,
    item: result.item,
  }));

  return [
    ...countyResults,
    ...constituencyResults,
    ...wardResults,
    ...subCountyResults,
    ...localityResults,
    ...areaResults,
  ]
    .sort((a, b) => {
      const typeOrder = {
        county: 1,
        constituency: 2,
        ward: 3,
        "sub-county": 4,
        locality: 5,
        area: 6,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    })
    .slice(0, limit);
}
