import data from "../generated/villages.json";
import { BUCREP_SOURCES, type PopulationRow, population } from "./data/hydrate";
import { toLabel } from "./data/label";
import { recordIndex } from "./data/records";
import { arrondissementOf, isWithin, normalizeCode } from "./data/scope";
import type { Pcode, Village } from "./types";

export type { Village } from "./types";

const CANTON_ID = /^CM\d{9}-C\d{2}$/;

type Row = readonly [name: string, ...population: number[]];
type Group = readonly [cantonId: string, villages: readonly Row[]];

/** The 17,070 quartiers and villages printed by BUCREP (2005), ordered by id. Deep-frozen. */
export const villages: readonly Village[] = Object.freeze(
  (data.villages as unknown as readonly Group[]).flatMap(([cantonId, rows]) =>
    rows.map(([name, ...pop], i) =>
      Object.freeze<Village>({
        id: `${cantonId}-V${String(i + 1).padStart(3, "0")}`,
        cantonId,
        arrondissementPcode: arrondissementOf(cantonId),
        name,
        label: toLabel(name),
        population2005: population(pop as PopulationRow),
        sources: BUCREP_SOURCES,
      }),
    ),
  ),
);

const index = recordIndex(villages);

/**
 * The village with this id (`<canton id>-Vnnn`), if any. Case and
 * surrounding whitespace are ignored.
 */
export function getVillage(id: string): Village | undefined {
  return index.get(id);
}

/**
 * Villages of a canton (by id) or of an arrondissement, division or region
 * (by P-code). Case and surrounding whitespace are ignored; anything else,
 * including a name or a partial code, returns an empty array.
 */
export function getVillages(within: string): readonly Village[] {
  const scope = normalizeCode(within);
  return CANTON_ID.test(scope)
    ? index.scope(scope, (v) => v.cantonId === scope)
    : index.scope(scope, (v) => isWithin(v.arrondissementPcode, scope));
}

/**
 * Villages whose normalised name matches, optionally `within` a P-code. Many
 * names are shared (see the docs), so this returns every match.
 * `within: ""` (or whitespace) means no restriction, like `undefined`; any
 * other value that is not a P-code matches nothing.
 */
export function findVillages(
  name: string,
  options?: { readonly within?: Pcode | undefined },
): readonly Village[] {
  return index.find(name, options?.within);
}
