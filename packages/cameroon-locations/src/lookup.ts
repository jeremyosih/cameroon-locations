import { arrondissements, divisions, regions } from "./data/admin";
import { normalizeName } from "./normalize";
import type {
  AdminLevel,
  AdminUnit,
  Arrondissement,
  Division,
  Pcode,
  Region,
} from "./types";

/**
 * `query` accepted by every lookup: a P-code (`CM004`), a HASC code
 * (`CM.EN`), or any name or alias in French or English. Names are compared
 * with {@link normalizeName}, so case, accents and numbering style don't matter.
 */
export type LocationQuery = string;

export interface FindOptions {
  /** Restrict to one level. */
  readonly level?: AdminLevel;
  /** Restrict to descendants of this P-code. */
  readonly within?: Pcode;
}

interface Index {
  /** P-codes and HASC codes, upper case. */
  readonly codes: Map<string, AdminUnit>;
  readonly pcodes: Map<Pcode, AdminUnit>;
  /** Normalised name or alias to every unit carrying it, in P-code order. */
  readonly names: Map<string, readonly AdminUnit[]>;
  /** Parent P-code (`"CM"` for regions) to direct children. */
  readonly children: Map<string, readonly AdminUnit[]>;
  /** Region P-code to all its arrondissements. */
  readonly regionArrondissements: Map<Pcode, readonly Arrondissement[]>;
}

const EMPTY: readonly never[] = Object.freeze([]);
const PCODE = /^CM\d{3}(?:\d{3}(?:\d{3})?)?$/;

let index: Index | undefined;

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (!list) map.set(key, [value]);
  else if (list.at(-1) !== value) list.push(value);
}

function freezeValues<K, V>(map: Map<K, V[]>): Map<K, readonly V[]> {
  for (const list of map.values()) Object.freeze(list);
  return map;
}

function getIndex(): Index {
  if (index) return index;
  const codes = new Map<string, AdminUnit>();
  const pcodes = new Map<Pcode, AdminUnit>();
  const names = new Map<string, AdminUnit[]>();
  const children = new Map<string, AdminUnit[]>();
  const regionArrondissements = new Map<Pcode, Arrondissement[]>();
  for (const unit of [...regions, ...divisions, ...arrondissements]) {
    pcodes.set(unit.pcode, unit);
    codes.set(unit.pcode, unit);
    if (unit.hasc) codes.set(unit.hasc.toUpperCase(), unit);
    for (const name of [unit.name.fr, unit.name.en, unit.refName]) {
      push(names, normalizeName(name), unit);
    }
    for (const alias of unit.aliases) {
      push(names, normalizeName(alias.name), unit);
    }
    push(children, unit.parentPcode ?? "CM", unit);
    if (unit.level === "arrondissement") {
      push(regionArrondissements, unit.regionPcode, unit);
    }
  }
  index = {
    codes,
    pcodes,
    names: freezeValues(names),
    children: freezeValues(children),
    regionArrondissements: freezeValues(regionArrondissements),
  };
  return index;
}

function isWithin(unit: AdminUnit, within: Pcode): boolean {
  return unit.pcode.length > within.length && unit.pcode.startsWith(within);
}

/** Every unit matching `query` by code, then by normalised name. */
function resolve(
  query: LocationQuery,
  options: FindOptions = {},
): readonly AdminUnit[] {
  const { codes, names } = getIndex();
  const code = codes.get(query.trim().toUpperCase());
  const matches = code ? [code] : (names.get(normalizeName(query)) ?? EMPTY);
  const { level } = options;
  const within = options.within?.trim().toUpperCase();
  if (!level && !within) return matches;
  return matches.filter(
    (unit) =>
      (!level || unit.level === level) && (!within || isWithin(unit, within)),
  );
}

function getOne<L extends AdminLevel>(
  query: LocationQuery,
  level: L,
  within?: Pcode,
): Extract<AdminUnit, { level: L }> | undefined {
  const matches = resolve(query, within ? { level, within } : { level });
  return matches.length === 1
    ? (matches[0] as Extract<AdminUnit, { level: L }>)
    : undefined;
}

/** Returns `undefined` when nothing matches or the name is ambiguous. */
export function getRegion(query: LocationQuery): Region | undefined {
  return getOne(query, "region");
}
export function getDivision(
  query: LocationQuery,
  options?: { readonly within?: Pcode },
): Division | undefined {
  return getOne(query, "division", options?.within);
}
export function getArrondissement(
  query: LocationQuery,
  options?: { readonly within?: Pcode },
): Arrondissement | undefined {
  return getOne(query, "arrondissement", options?.within);
}
/** Any level, by P-code only. */
export function getUnit(pcode: Pcode): AdminUnit | undefined {
  return getIndex().pcodes.get(pcode.trim().toUpperCase());
}
/** Every unit whose code, name or alias matches exactly (normalised). */
export function find(
  query: LocationQuery,
  options?: FindOptions,
): readonly AdminUnit[] {
  const matches = resolve(query, options);
  return Object.isFrozen(matches) ? matches : Object.freeze(matches);
}
export function getParent(pcode: Pcode): Region | Division | undefined {
  const parent = getUnit(pcode)?.parentPcode;
  return parent ? (getUnit(parent) as Region | Division) : undefined;
}
/** Ancestors from the region down, excluding the unit itself. */
export function getAncestors(pcode: Pcode): readonly (Region | Division)[] {
  const ancestors: (Region | Division)[] = [];
  for (let p = getParent(pcode); p; p = getParent(p.pcode)) {
    ancestors.unshift(p);
  }
  return Object.freeze(ancestors);
}
/** Direct children. `"CM"` returns the regions. */
export function getChildren(pcode: Pcode): readonly AdminUnit[] {
  return getIndex().children.get(pcode.trim().toUpperCase()) ?? EMPTY;
}
/** All divisions, or those of one region. */
export function getDivisions(region?: LocationQuery): readonly Division[] {
  if (region === undefined) return divisions;
  const unit = getRegion(region);
  return unit ? (getChildren(unit.pcode) as readonly Division[]) : EMPTY;
}
/** All arrondissements, or those of one region or division. */
export function getArrondissements(
  within?: LocationQuery,
): readonly Arrondissement[] {
  if (within === undefined) return arrondissements;
  const units = resolve(within).filter((u) => u.level !== "arrondissement");
  const unit = units.length === 1 ? units[0] : undefined;
  if (unit?.level === "region") {
    return getIndex().regionArrondissements.get(unit.pcode) ?? EMPTY;
  }
  if (unit?.level === "division") {
    return getChildren(unit.pcode) as readonly Arrondissement[];
  }
  return EMPTY;
}
export function isPcode(value: string): value is Pcode {
  return PCODE.test(value);
}
