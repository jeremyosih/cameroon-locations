import { notImplemented } from "./internal";
import type { Canton, Pcode } from "./types";

export type { Canton } from "./types";

// Owner: data generation. 1,504 cantons from generated/cantons.json.
export const cantons: readonly Canton[] = Object.freeze([]);

export function getCanton(_id: string): Canton | undefined {
  return notImplemented("getCanton");
}
/** Cantons of an arrondissement, division or region (by P-code). */
export function getCantons(_within: Pcode): readonly Canton[] {
  return notImplemented("getCantons");
}
/** Cantons whose normalised name matches, optionally within a P-code. */
export function findCantons(
  _name: string,
  _options?: { readonly within?: Pcode },
): readonly Canton[] {
  return notImplemented("findCantons");
}
