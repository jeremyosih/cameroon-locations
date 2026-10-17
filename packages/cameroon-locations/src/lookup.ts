import { notImplemented } from "./internal";
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

/** Returns `undefined` when nothing matches or the name is ambiguous. */
export function getRegion(_query: LocationQuery): Region | undefined {
  return notImplemented("getRegion");
}
export function getDivision(
  _query: LocationQuery,
  _options?: { readonly within?: Pcode },
): Division | undefined {
  return notImplemented("getDivision");
}
export function getArrondissement(
  _query: LocationQuery,
  _options?: { readonly within?: Pcode },
): Arrondissement | undefined {
  return notImplemented("getArrondissement");
}
/** Any level, by P-code only. */
export function getUnit(_pcode: Pcode): AdminUnit | undefined {
  return notImplemented("getUnit");
}
/** Every unit whose code, name or alias matches exactly (normalised). */
export function find(
  _query: LocationQuery,
  _options?: FindOptions,
): readonly AdminUnit[] {
  return notImplemented("find");
}
export function getParent(_pcode: Pcode): Region | Division | undefined {
  return notImplemented("getParent");
}
/** Ancestors from the region down, excluding the unit itself. */
export function getAncestors(_pcode: Pcode): readonly (Region | Division)[] {
  return notImplemented("getAncestors");
}
/** Direct children. `"CM"` returns the regions. */
export function getChildren(_pcode: Pcode): readonly AdminUnit[] {
  return notImplemented("getChildren");
}
/** All divisions, or those of one region. */
export function getDivisions(_region?: LocationQuery): readonly Division[] {
  return notImplemented("getDivisions");
}
/** All arrondissements, or those of one region or division. */
export function getArrondissements(
  _within?: LocationQuery,
): readonly Arrondissement[] {
  return notImplemented("getArrondissements");
}
export function isPcode(_value: string): _value is Pcode {
  return notImplemented("isPcode");
}
