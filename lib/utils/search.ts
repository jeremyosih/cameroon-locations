import Fuse from "fuse.js";
import type { SearchResult } from "../types";
import { counties, constituencies, wards } from "../data";
import { subCounties } from "../data/sub-counties";

/**
 * Configuration for Fuse.js fuzzy search
 */
const countySearchOptions = {
  keys: ["name", "code"],
  threshold: 0.3,
  includeScore: true,
};

const constituencySearchOptions = {
  keys: ["name", "code", "countyCode"],
  threshold: 0.3,
  includeScore: true,
};

const wardSearchOptions = {
  keys: ["name", "code", "constituencyCode"],
  threshold: 0.3,
  includeScore: true,
};

const subCountySearchOptions = {
  keys: ["name", "code", "countyCode"],
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

  return [
    ...countyResults,
    ...constituencyResults,
    ...wardResults,
    ...subCountyResults,
  ]
    .sort((a, b) => {
      // Sort by relevance - we'd use the Fuse.js score if needed
      // But we could also prioritize counties over constituencies over wards
      const typeOrder = {
        county: 1,
        constituency: 2,
        ward: 3,
        "sub-county": 4,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    })
    .slice(0, limit);
}
