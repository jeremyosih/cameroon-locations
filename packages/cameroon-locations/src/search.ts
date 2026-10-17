import { notImplemented } from "./internal";
import type { AdminLevel, AdminUnit, Pcode } from "./types";

export interface SearchOptions {
  readonly levels?: readonly AdminLevel[];
  readonly within?: Pcode;
  /** Default 10. */
  readonly limit?: number;
}

export interface SearchResult<T = AdminUnit> {
  readonly item: T;
  /** 0 (worst) to 1 (exact). */
  readonly score: number;
  /** The name or alias that matched. */
  readonly matched: string;
}

/**
 * Typo-tolerant search over regions, divisions and arrondissements, across
 * French and English names and every alias. Dependency-free.
 */
export function search(
  _query: string,
  _options?: SearchOptions,
): readonly SearchResult[] {
  return notImplemented("search");
}

/** Builds the same search over any records, e.g. villages or cantons. */
export function createSearch<T>(
  _items: readonly T[],
  _names: (item: T) => readonly string[],
): (
  query: string,
  options?: { readonly limit?: number },
) => readonly SearchResult<T>[] {
  return notImplemented("createSearch");
}
