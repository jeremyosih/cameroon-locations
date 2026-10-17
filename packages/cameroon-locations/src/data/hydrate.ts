import type { Pcode, Population, SourceId } from "../types";

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

const PCODE = /^CM\d{3}(?:\d{3}){0,2}$/;

/** True for a region, division or arrondissement P-code. */
export const isAdminPcode = (value: string): boolean => PCODE.test(value);

/** Arrondissement P-code is the first 11 characters of canton and village ids. */
export const arrondissementOf = (id: string): Pcode => id.slice(0, 11);

export const EMPTY: readonly never[] = Object.freeze([]);
