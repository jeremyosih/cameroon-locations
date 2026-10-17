import data from "../generated/cantons.json";
import { BUCREP_SOURCES, type PopulationRow, population } from "./data/hydrate";
import { toLabel } from "./data/label";
import { recordIndex } from "./data/records";
import { isWithin, normalizeCode } from "./data/scope";
import type { Canton, Pcode } from "./types";

export type { Canton } from "./types";

type Row = readonly [name: string, ...population: number[]];
type Group = readonly [arrondissementPcode: string, cantons: readonly Row[]];

/** The 1,504 cantons printed by BUCREP (2005), ordered by id. Deep-frozen. */
export const cantons: readonly Canton[] = Object.freeze(
  (data.cantons as unknown as readonly Group[]).flatMap(([pcode, rows]) =>
    rows.map(([name, ...pop], i) =>
      Object.freeze<Canton>({
        id: `${pcode}-C${String(i + 1).padStart(2, "0")}`,
        arrondissementPcode: pcode,
        name,
        label: toLabel(name),
        population2005: population(pop as PopulationRow),
        sources: BUCREP_SOURCES,
      }),
    ),
  ),
);

const index = recordIndex(cantons);

/**
 * The canton with this id (`<arrondissement pcode>-Cnn`), if any. Case and
 * surrounding whitespace are ignored.
 */
export function getCanton(id: string): Canton | undefined {
  return index.get(id);
}

/**
 * Cantons of an arrondissement, division or region, by P-code (case and
 * surrounding whitespace ignored). Anything else, including a name or a
 * partial code, returns an empty array.
 */
export function getCantons(within: Pcode): readonly Canton[] {
  const scope = normalizeCode(within);
  return index.scope(scope, (c) => isWithin(c.arrondissementPcode, scope));
}

/**
 * Cantons whose normalised name matches, optionally `within` a P-code.
 * `within: ""` (or whitespace) means no restriction, like `undefined`; any
 * other value that is not a P-code (see {@link getCantons}) matches nothing.
 */
export function findCantons(
  name: string,
  options?: { readonly within?: Pcode | undefined },
): readonly Canton[] {
  return index.find(name, options?.within);
}
