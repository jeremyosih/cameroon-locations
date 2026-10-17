import { normalizeName } from "../normalize";
import { EMPTY, isWithin, normalizeCode } from "./scope";

interface PlaceRecord {
  readonly id: string;
  readonly name: string;
  readonly arrondissementPcode: string;
}

/** Lazy lookups shared by cantons and villages. */
export interface RecordIndex<T> {
  /** The record with this id, compared trimmed and upper case. */
  get(id: string): T | undefined;
  /** Records whose normalised name matches, optionally within a P-code. */
  find(name: string, within: string | undefined): readonly T[];
  /**
   * Records selected by `test`, cached under `key` (already normalised).
   * Only non-empty results are cached, so junk keys cannot grow the cache.
   */
  scope(key: string, test: (record: T) => boolean): readonly T[];
}

export function recordIndex<T extends PlaceRecord>(
  records: readonly T[],
): RecordIndex<T> {
  let byId: Map<string, T> | undefined;
  let byName: Map<string, readonly T[]> | undefined;
  const byScope = new Map<string, readonly T[]>();
  return {
    get(id) {
      byId ??= new Map(records.map((r) => [r.id, r]));
      return byId.get(normalizeCode(id));
    },
    find(name, within) {
      if (!byName) {
        const groups = new Map<string, T[]>();
        for (const r of records) {
          const key = normalizeName(r.name);
          const list = groups.get(key);
          if (list) list.push(r);
          else groups.set(key, [r]);
        }
        for (const list of groups.values()) Object.freeze(list);
        byName = groups;
      }
      const matches = byName.get(normalizeName(name)) ?? EMPTY;
      if (within === undefined) return matches;
      const scope = normalizeCode(within);
      const scoped = matches.filter((r) =>
        isWithin(r.arrondissementPcode, scope),
      );
      return scoped.length ? Object.freeze(scoped) : EMPTY;
    },
    scope(key, test) {
      const cached = byScope.get(key);
      if (cached) return cached;
      const list = records.filter(test);
      if (!list.length) return EMPTY;
      Object.freeze(list);
      byScope.set(key, list);
      return list;
    },
  };
}
