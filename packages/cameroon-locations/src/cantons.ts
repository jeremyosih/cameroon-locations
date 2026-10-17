import data from "../generated/cantons.json";
import {
  EMPTY,
  isAdminPcode,
  type PopulationRow,
  population,
} from "./data/hydrate";
import { toLabel } from "./data/label";
import { normalizeName } from "./normalize";
import type { Canton, Pcode, SourceId } from "./types";

export type { Canton } from "./types";

const SOURCES: readonly SourceId[] = Object.freeze([
  "bucrep-rgph2005-repertoire-villages",
]);

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
        sources: SOURCES,
      }),
    ),
  ),
);

let byId: Map<string, Canton> | undefined;
let byName: Map<string, Canton[]> | undefined;
const byScope = new Map<string, readonly Canton[]>();

/** The canton with this id (`<arrondissement pcode>-Cnn`), if any. */
export function getCanton(id: string): Canton | undefined {
  byId ??= new Map(cantons.map((c) => [c.id, c]));
  return byId.get(id);
}

/** Cantons of an arrondissement, division or region (by P-code). */
export function getCantons(within: Pcode): readonly Canton[] {
  if (!isAdminPcode(within)) return EMPTY;
  let list = byScope.get(within);
  if (!list) {
    list = Object.freeze(
      cantons.filter((c) => c.arrondissementPcode.startsWith(within)),
    );
    byScope.set(within, list);
  }
  return list;
}

/** Cantons whose normalised name matches, optionally within a P-code. */
export function findCantons(
  name: string,
  options?: { readonly within?: Pcode },
): readonly Canton[] {
  if (!byName) {
    byName = new Map();
    for (const c of cantons) {
      const key = normalizeName(c.name);
      const list = byName.get(key);
      if (list) list.push(c);
      else byName.set(key, [c]);
    }
  }
  const matches = byName.get(normalizeName(name)) ?? EMPTY;
  const scope = options?.within;
  if (scope === undefined) return Object.freeze([...matches]);
  if (!isAdminPcode(scope)) return EMPTY;
  return Object.freeze(
    matches.filter((c) => c.arrondissementPcode.startsWith(scope)),
  );
}
