import data from "../../generated/admin.json";
import type {
  Alias,
  Arrondissement,
  BBox,
  Division,
  Language,
  LngLat,
  Region,
} from "../types";
import { type PopulationRow, population, sourceLists } from "./hydrate";

interface UnitRow {
  readonly pcode: string;
  readonly name: readonly string[];
  readonly ordinal?: number;
  readonly refName: string;
  readonly aliases: readonly (readonly (string | readonly number[])[])[];
  readonly hasc?: string;
  readonly wikidata?: string;
  readonly areaSqKm: number;
  readonly centroid: readonly number[];
  readonly bbox: readonly number[];
  readonly population2005?: PopulationRow;
  readonly sources: readonly number[];
}

const sourceList = sourceLists(data.sources);

function unit(row: UnitRow) {
  const [fr = "", en = fr] = row.name;
  const aliases = row.aliases.map(([name, ids, lang]) => {
    const alias: Alias = {
      name: name as string,
      sources: sourceList(ids as readonly number[]),
      ...(lang ? { lang: lang as Language } : {}),
    };
    return Object.freeze(alias);
  });
  return {
    pcode: row.pcode,
    name: Object.freeze({ fr, en }),
    refName: row.refName,
    aliases: Object.freeze(aliases),
    ...(row.hasc ? { hasc: row.hasc } : {}),
    ...(row.wikidata ? { wikidata: row.wikidata } : {}),
    areaSqKm: row.areaSqKm,
    centroid: Object.freeze([...row.centroid]) as unknown as LngLat,
    bbox: Object.freeze([...row.bbox]) as unknown as BBox,
    ...(row.population2005
      ? { population2005: population(row.population2005) }
      : {}),
    sources: sourceList(row.sources),
  };
}

/** The 10 regions, ordered by P-code. Records are deep-frozen. */
export const regions: readonly Region[] = Object.freeze(
  (data.regions as readonly UnitRow[]).map((row) =>
    Object.freeze<Region>({
      ...unit(row),
      level: "region",
      parentPcode: null,
    }),
  ),
);

/** The 58 divisions (départements), ordered by P-code. */
export const divisions: readonly Division[] = Object.freeze(
  (data.divisions as readonly UnitRow[]).map((row) =>
    Object.freeze<Division>({
      ...unit(row),
      level: "division",
      parentPcode: row.pcode.slice(0, 5),
      regionPcode: row.pcode.slice(0, 5),
    }),
  ),
);

/** The 360 arrondissements (subdivisions), ordered by P-code. */
export const arrondissements: readonly Arrondissement[] = Object.freeze(
  (data.arrondissements as readonly UnitRow[]).map((row) =>
    Object.freeze<Arrondissement>({
      ...unit(row),
      level: "arrondissement",
      parentPcode: row.pcode.slice(0, 8),
      regionPcode: row.pcode.slice(0, 5),
      divisionPcode: row.pcode.slice(0, 8),
      ...(row.ordinal !== undefined ? { ordinal: row.ordinal } : {}),
    }),
  ),
);
