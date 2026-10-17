import data from "../generated/villages.json";
import {
  arrondissementOf,
  EMPTY,
  isAdminPcode,
  type PopulationRow,
  population,
} from "./data/hydrate";
import { toLabel } from "./data/label";
import { normalizeName } from "./normalize";
import type { Pcode, SourceId, Village } from "./types";

export type { Village } from "./types";

const SOURCES: readonly SourceId[] = Object.freeze([
  "bucrep-rgph2005-repertoire-villages",
]);
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
        sources: SOURCES,
      }),
    ),
  ),
);

let byId: Map<string, Village> | undefined;
let byName: Map<string, Village[]> | undefined;
const byScope = new Map<string, readonly Village[]>();

/** The village with this id (`<canton id>-Vnnn`), if any. */
export function getVillage(id: string): Village | undefined {
  byId ??= new Map(villages.map((v) => [v.id, v]));
  return byId.get(id);
}

/** Villages of a canton (by id) or of an arrondissement, division or region (by P-code). */
export function getVillages(within: string): readonly Village[] {
  const isCanton = CANTON_ID.test(within);
  if (!isCanton && !isAdminPcode(within)) return EMPTY;
  let list = byScope.get(within);
  if (!list) {
    list = Object.freeze(
      villages.filter((v) =>
        isCanton
          ? v.cantonId === within
          : v.arrondissementPcode.startsWith(within),
      ),
    );
    byScope.set(within, list);
  }
  return list;
}

/** Villages whose normalised name matches. 2,000+ village names repeat, so this returns all. */
export function findVillages(
  name: string,
  options?: { readonly within?: Pcode },
): readonly Village[] {
  if (!byName) {
    byName = new Map();
    for (const v of villages) {
      const key = normalizeName(v.name);
      const list = byName.get(key);
      if (list) list.push(v);
      else byName.set(key, [v]);
    }
  }
  const matches = byName.get(normalizeName(name)) ?? EMPTY;
  const scope = options?.within;
  if (scope === undefined) return Object.freeze([...matches]);
  if (!isAdminPcode(scope)) return EMPTY;
  return Object.freeze(
    matches.filter((v) => v.arrondissementPcode.startsWith(scope)),
  );
}
