import Fuse from "fuse.js";
import type { SearchResult } from "../types";
import {
  regions,
  divisions,
  subdivisions,
  cantons,
  neighborhoodsOrVillages,
  blocks,
} from "../data";

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
 * Configuration for Fuse.js fuzzy search - optimized for bilingual search
 * Threshold of 0.2 provides better precision when searching while still allowing for typos
 * Searches both French (nameFr) and English (nameEn) names
 */
const searchOptions = {
  keys: ["nameFr", "nameEn"],
  threshold: 0.2,
  includeScore: true,
  ignoreLocation: true, // Performance optimization
  findAllMatches: false, // Performance optimization
  minMatchCharLength: 2, // Performance optimization
};

/**
 * Lazy-initialized Fuse instances for better performance
 */
let regionFuse: Fuse<any> | null = null;
let divisionFuse: Fuse<any> | null = null;
let subdivisionFuse: Fuse<any> | null = null;
let cantonFuse: Fuse<any> | null = null;
let neighborhoodOrVillageFuse: Fuse<any> | null = null;
let blockFuse: Fuse<any> | null = null;

/**
 * Initialize Fuse instances only when needed
 */
function initializeFuseInstances() {
  if (!regionFuse) regionFuse = new Fuse(regions, searchOptions);
  if (!divisionFuse) divisionFuse = new Fuse(divisions, searchOptions);
  if (!subdivisionFuse) subdivisionFuse = new Fuse(subdivisions, searchOptions);
  if (!cantonFuse) cantonFuse = new Fuse(cantons, searchOptions);
  if (!neighborhoodOrVillageFuse)
    neighborhoodOrVillageFuse = new Fuse(
      neighborhoodsOrVillages,
      searchOptions
    );
  if (!blockFuse) blockFuse = new Fuse(blocks, searchOptions);
}

/**
 * Search across all levels of administrative divisions
 * @param query Search query string
 * @param options Search options
 * @param options.limit Maximum number of results (default: 10)
 * @param options.types Specific types to search (optional, searches all if not provided)
 * @returns Array of search results sorted by relevance and type hierarchy
 */
export function search(
  query: string,
  options: {
    limit?: number;
    types?: SearchType[];
  } = {}
): SearchResult[] {
  const { limit = 10, types } = options;

  // Don't perform search if query is too short
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Initialize Fuse instances
  initializeFuseInstances();

  const trimmedQuery = query.trim();
  const results: Array<SearchResult & { score?: number }> = [];

  // Define search functions with type guards
  const searchFunctions = [
    {
      type: "region" as const,
      fuse: regionFuse!,
      enabled: !types || types.includes("region"),
    },
    {
      type: "division" as const,
      fuse: divisionFuse!,
      enabled: !types || types.includes("division"),
    },
    {
      type: "subdivision" as const,
      fuse: subdivisionFuse!,
      enabled: !types || types.includes("subdivision"),
    },
    {
      type: "canton" as const,
      fuse: cantonFuse!,
      enabled: !types || types.includes("canton"),
    },
    {
      type: "neighborhoodOrVillage" as const,
      fuse: neighborhoodOrVillageFuse!,
      enabled: !types || types.includes("neighborhoodOrVillage"),
    },
    {
      type: "block" as const,
      fuse: blockFuse!,
      enabled: !types || types.includes("block"),
    },
  ];

  // Perform searches only for enabled types
  for (const { type, fuse, enabled } of searchFunctions) {
    if (enabled) {
      const searchResults = fuse.search(trimmedQuery, { limit: limit * 2 }); // Get more results for better sorting
      results.push(
        ...searchResults.map((result) => ({
          type,
          item: result.item,
          score: result.score,
        }))
      );
    }
  }

  // Sort by score first (lower is better), then by type hierarchy
  const typeOrder = {
    region: 1,
    division: 2,
    subdivision: 3,
    canton: 4,
    neighborhoodOrVillage: 5,
    block: 6,
  };

  return (
    results
      .sort((a, b) => {
        // Primary sort: by score (lower score = better match)
        if (a.score !== b.score) {
          return (a.score || 0) - (b.score || 0);
        }
        // Secondary sort: by type hierarchy
        return typeOrder[a.type] - typeOrder[b.type];
      })
      .slice(0, limit)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ score, ...result }) => result)
  );
}

/**
 * Search for a specific type only
 * @param query Search query string
 * @param type The specific type to search for
 * @param limit Maximum number of results (default: 10)
 * @returns Array of search results for the specified type
 */
export function searchByType(
  query: string,
  type: SearchType,
  limit = 10
): SearchResult[] {
  return search(query, { limit, types: [type] });
}
