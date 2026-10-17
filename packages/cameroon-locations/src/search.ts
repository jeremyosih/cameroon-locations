import { arrondissements, divisions, regions } from "./data/admin";
import { isWithin, normalizeCode, normalizeWithin } from "./data/scope";
import { getByCode } from "./lookup";
import { normalizeName } from "./normalize";
import type { AdminLevel, AdminUnit, Pcode } from "./types";

export interface SearchOptions {
  /** Restrict to these levels. Omitted or empty means every level. */
  readonly levels?: readonly AdminLevel[] | undefined;
  /**
   * Restrict to descendants of this P-code (case and surrounding whitespace
   * ignored). `""` or whitespace means no restriction, like `undefined`. Any
   * other value that is not a P-code, such as a name or a partial code like
   * `"CM00"`, matches nothing.
   */
  readonly within?: Pcode | undefined;
  /** Default 10. Zero or less returns nothing. */
  readonly limit?: number | undefined;
}

export interface SearchResult<T = AdminUnit> {
  readonly item: T;
  /** 0 (worst) to 1 (exact). */
  readonly score: number;
  /** The name or alias that matched. */
  readonly matched: string;
}

type Engine<T> = (
  query: string,
  limit: number,
  accept?: (item: T) => boolean,
) => readonly SearchResult<T>[];

// Edits tolerated for a normalised query of a given length.
const maxEdits = (length: number): number =>
  length < 3 ? 0 : length < 6 ? 1 : length < 10 ? 2 : 3;

// Reused DP rows for the bounded Damerau-Levenshtein below.
let rows: [Int32Array, Int32Array, Int32Array] = [
  new Int32Array(64),
  new Int32Array(64),
  new Int32Array(64),
];

/**
 * Fuzzy score of `q` against `key` read from word offset `start`, using the
 * optimal string alignment (Damerau-Levenshtein) distance bounded by `max`.
 * Matching the whole rest of `key` beats matching only a prefix of it (the
 * user may still be typing), which beats matching from a later word.
 */
function fuzzy(q: string, key: string, start: number, max: number): number {
  const m = q.length;
  const n = Math.min(key.length - start, m + max);
  if (n + 1 > rows[0].length) {
    const size = 2 * (n + 1);
    rows = [new Int32Array(size), new Int32Array(size), new Int32Array(size)];
  }
  let [before, prev, cur] = rows;
  // Indices below stay within the rows, sized above.
  // biome-ignore-start lint/style/noNonNullAssertion: hot loop over typed arrays
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const a = q.charCodeAt(i - 1);
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const b = key.charCodeAt(start + j - 1);
      let d = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a === b ? 0 : 1),
      );
      if (
        i > 1 &&
        j > 1 &&
        a === key.charCodeAt(start + j - 2) &&
        q.charCodeAt(i - 2) === b
      ) {
        d = Math.min(d, before[j - 2]! + 1);
      }
      cur[j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return 0;
    [before, prev, cur] = [prev, cur, before];
  }
  let prefix = max + 1;
  for (let j = Math.max(0, m - max); j <= n; j++) {
    if (prev[j]! < prefix) prefix = prev[j]!;
  }
  const whole = key.length - start === n ? prev[n]! : max + 1;
  // biome-ignore-end lint/style/noNonNullAssertion: hot loop over typed arrays
  const scale = (1 - 1 / (m + 1)) / m;
  if (start > 0) return 0.45 * scale * (m - prefix);
  return whole <= max ? 0.55 * scale * (m - whole) : 0.5 * scale * (m - prefix);
}

/**
 * Scores a normalised query against one normalised name. Bands keep the
 * ranking exact (1) > prefix (0.8..0.95) > word prefix (0.6..0.75) >
 * fuzzy (< 0.55); within a band, closer lengths and fewer edits score higher.
 * `missing` counts letters of `q` absent from `key`, a lower bound on edits.
 */
function score(
  q: string,
  key: string,
  words: readonly number[],
  missing: number,
): number {
  if (q === key) return 1;
  if (key.startsWith(q)) return 0.8 + (0.15 * q.length) / key.length;
  let best = 0;
  for (const start of words) {
    if (start > 0 && key.startsWith(q, start)) {
      best = Math.max(best, 0.6 + (0.15 * q.length) / (key.length - start));
    }
  }
  const max = maxEdits(q.length);
  if (best > 0 || missing > max) return best;
  for (const start of words) {
    if (key.length - start >= q.length - max) {
      best = Math.max(best, fuzzy(q, key, start, max));
    }
  }
  return best;
}

/** Bitmask of the characters in `s`, folded into 32 bits. */
function letters(s: string): number {
  let mask = 0;
  for (let i = 0; i < s.length; i++) mask |= 1 << (s.charCodeAt(i) % 32);
  return mask;
}

/** Number of set bits. */
function popcount(n: number): number {
  let count = 0;
  for (let v = n >>> 0; v; v &= v - 1) count++;
  return count;
}

// Sort key that orders "x 2" before "x 10".
const sortKey = (name: string): string =>
  normalizeName(name).replace(/\d+/g, (d) => d.padStart(6, "0"));

interface Candidate<T> {
  readonly item: T;
  /** Position in the tie-break order. */
  rank: number;
  /** Per-query state, reset after every query. */
  best: number;
  matched: string;
}

interface Entry<T> {
  readonly key: string;
  /** Offsets of each word in `key`. */
  readonly words: readonly number[];
  readonly mask: number;
  readonly label: string;
  readonly candidate: Candidate<T>;
}

function buildEngine<T>(
  items: readonly T[],
  names: (item: T) => readonly string[],
  group: (item: T) => number = () => 0,
): Engine<T> {
  const entries: Entry<T>[] = [];
  const order = items.map((item, index) => {
    const candidate: Candidate<T> = { item, rank: 0, best: 0, matched: "" };
    const labels = names(item);
    const seen = new Set<string>();
    for (const label of labels) {
      const key = normalizeName(label);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const words = [0, ...[...key.matchAll(/ /g)].map((s) => s.index + 1)];
      entries.push({ key, words, mask: letters(key), label, candidate });
    }
    return {
      candidate,
      index,
      group: group(item),
      key: sortKey(labels[0] ?? ""),
    };
  });
  // Tie-break: group (e.g. level), then name, then input order.
  order
    .sort(
      (a, b) =>
        a.group - b.group ||
        (a.key < b.key ? -1 : a.key > b.key ? 1 : a.index - b.index),
    )
    .forEach((o, rank) => {
      o.candidate.rank = rank;
    });

  return (query, limit, accept) => {
    const q = normalizeName(query);
    if (!q || limit <= 0) return Object.freeze([]);
    const qMask = letters(q);
    const hits: Candidate<T>[] = [];
    for (const { key, words, mask, label, candidate: c } of entries) {
      if (c.best === 1 || (accept && !accept(c.item))) continue;
      const s = score(q, key, words, popcount(qMask & ~mask));
      if (s <= c.best) continue;
      if (c.best === 0) hits.push(c);
      c.best = s;
      c.matched = label;
    }
    const results = hits
      .sort((a, b) => b.best - a.best || a.rank - b.rank)
      .slice(0, limit)
      .map((c) =>
        Object.freeze({ item: c.item, score: c.best, matched: c.matched }),
      );
    for (const c of hits) c.best = 0;
    return Object.freeze(results);
  };
}

const LEVELS: readonly AdminLevel[] = ["region", "division", "arrondissement"];
let adminEngine: Engine<AdminUnit> | undefined;

/**
 * Typo-tolerant search over regions, divisions and arrondissements, across
 * French and English names and every alias. An exact P-code or HASC code
 * (`CM002007`, `CM.CE`) is the first result, with score 1. Dependency-free.
 */
export function search(
  query: string,
  options: SearchOptions = {},
): readonly SearchResult[] {
  adminEngine ??= buildEngine<AdminUnit>(
    [...regions, ...divisions, ...arrondissements],
    (u) => [u.name.fr, u.name.en, u.refName, ...u.aliases.map((a) => a.name)],
    (u) => LEVELS.indexOf(u.level),
  );
  const levels = options.levels?.length ? options.levels : undefined;
  const within = normalizeWithin(options.within);
  const filter =
    levels || within !== undefined
      ? (u: AdminUnit) =>
          (!levels || levels.includes(u.level)) &&
          (within === undefined ||
            (u.pcode !== within && isWithin(u.pcode, within)))
      : undefined;
  const limit = options.limit ?? 10;
  const code = getByCode(query);
  if (!code || !(limit >= 1) || (filter && !filter(code))) {
    return adminEngine(query, limit, filter);
  }
  const exact = Object.freeze({
    item: code,
    score: 1,
    matched:
      code.pcode === normalizeCode(query) ? code.pcode : (code.hasc ?? ""),
  });
  const rest = adminEngine(
    query,
    limit - 1,
    (u) => u !== code && (!filter || filter(u)),
  );
  return Object.freeze([exact, ...rest]);
}

/** Builds the same search over any records, e.g. villages or cantons. */
export function createSearch<T>(
  items: readonly T[],
  names: (item: T) => readonly string[],
): (
  query: string,
  options?: { readonly limit?: number | undefined },
) => readonly SearchResult<T>[] {
  const engine = buildEngine(items, names);
  return (query, options) => engine(query, options?.limit ?? 10);
}
