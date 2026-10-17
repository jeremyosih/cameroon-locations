import { notImplemented } from "./internal";
import type { Pcode, Village } from "./types";

export type { Village } from "./types";

// Owner: data generation. 17,070 villages from generated/villages.json.
export const villages: readonly Village[] = Object.freeze([]);

export function getVillage(_id: string): Village | undefined {
  return notImplemented("getVillage");
}
/** Villages of a canton (by id) or of an arrondissement, division or region (by P-code). */
export function getVillages(_within: string): readonly Village[] {
  return notImplemented("getVillages");
}
/** Villages whose normalised name matches. 2,000+ village names repeat, so this returns all. */
export function findVillages(
  _name: string,
  _options?: { readonly within?: Pcode },
): readonly Village[] {
  return notImplemented("findVillages");
}
