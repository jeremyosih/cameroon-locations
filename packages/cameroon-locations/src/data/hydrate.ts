import type { Population, SourceId } from "../types";

/** Population as stored in generated/*.json: `[male, female, total?]`. */
export type PopulationRow = readonly number[];

/** Total is omitted when it equals male + female (printed values kept). */
export function population(row: PopulationRow): Population {
  const [male = 0, female = 0, total = male + female] = row;
  return Object.freeze({ total, male, female });
}

/** Interns frozen source-id lists so records share one array per combination. */
export function sourceLists(table: readonly string[]) {
  const cache = new Map<string, readonly SourceId[]>();
  return (indexes: readonly number[]): readonly SourceId[] => {
    const key = indexes.join();
    let list = cache.get(key);
    if (!list) {
      list = Object.freeze(indexes.map((i) => table[i] as SourceId));
      cache.set(key, list);
    }
    return list;
  };
}

/** `sources` of every canton and village, shared by all of them. */
export const BUCREP_SOURCES: readonly SourceId[] = Object.freeze([
  "bucrep-rgph2005-repertoire-villages",
]);

/** `sources` of every polling station and council summary. */
export const ELECAM_SOURCES: readonly SourceId[] = Object.freeze([
  "elecam-polling-stations-2025",
]);
