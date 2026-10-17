/**
 * data/canonical → packages/cameroon-locations/generated/*.json
 *
 * Deterministic: the same canonical input always gives byte-identical output.
 * The only date written is derived from the sources (latest retrieval date).
 * Reads only data/canonical and data/decisions (plain Git, no LFS).
 *
 * Output is compact; `src/data/admin.ts`, `src/cantons.ts`, `src/villages.ts`
 * and `src/elecam.ts` hydrate it into frozen records:
 * - admin.json: one object per unit; `name` is `[fr, en?]`, aliases are
 *   `[name, sourceIndexes, lang?]`, sources are indexes into `sources`;
 *   level and parent P-codes are derived from the P-code.
 * - cantons.json: `[arrondissementPcode, [[name, male, female, total?]…]]`;
 *   ids (`-Cnn`) follow the row order. villages.json: the same per canton
 *   (`-Vnnn`). `total` is only written when it differs from male + female.
 * - elecam.json: runs of `[pcode | null, council, [[centre, [[station,
 *   voters]…]]…]]` in roll order, and one council summary per arrondissement.
 * Labels and the default BUCREP `sources` are derived at load time.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeName } from "../src/normalize";
import { sources } from "../src/sources";
import type { SourceId } from "../src/types";

const pkg = join(import.meta.dir, "..");
const data = join(pkg, "../../data");
const canonical = join(data, "canonical");
const out = join(pkg, "generated");

// ---------------------------------------------------------------------------
// Canonical input types (only the fields read here)

interface CanonicalAlias {
  name: string;
  source: SourceId;
  lang?: "fr" | "en";
}
interface CanonicalPopulation {
  total: number;
  male: number;
  female: number;
}
interface CanonicalWikidata {
  qid: string;
  entityScope: string;
  confidence: "high" | "medium" | "low";
}
interface CanonicalUnit {
  pcode: string;
  parentPcode: string;
  name: { fr: string; en?: string };
  refName: string;
  areaSqKm: number;
  centroid: [number, number];
  bbox: [number, number, number, number];
  aliases: CanonicalAlias[];
  sources: Record<string, unknown>;
  population2005?: CanonicalPopulation & { source: SourceId };
  hasc?: { code: string; source: SourceId };
  wikidata?: CanonicalWikidata & { source: SourceId };
  wikidataCandidate?: CanonicalWikidata & { source: SourceId };
  elecam2025?: {
    council: string;
    registeredVoters: number;
    pollingCentres: number;
    pollingStations: number;
  };
}
interface CanonicalCanton {
  id: string;
  adm3Pcode: string;
  name: string;
  population2005: CanonicalPopulation;
  source: { id: SourceId };
}
interface CanonicalVillage extends CanonicalCanton {
  cantonId: string;
}
interface CanonicalStation {
  adm3Pcode: string | null;
  council: string;
  centre: string;
  station: string;
  registeredVoters: number;
}
interface DisplayNames {
  entries: { pcodes: string[]; ocha: string; fr: string; en?: string }[];
}

const read = <T>(file: string): T =>
  JSON.parse(readFileSync(join(canonical, file), "utf8")) as T;
const fail = (message: string): never => {
  throw new Error(`generate: ${message}`);
};

const adm1 = read<CanonicalUnit[]>("adm1-regions.json");
const adm2 = read<CanonicalUnit[]>("adm2-divisions.json");
const adm3 = read<CanonicalUnit[]>("adm3-arrondissements.json");
const cantons = read<CanonicalCanton[]>("cantons.json");
const villages = read<CanonicalVillage[]>("villages.json");
const stations = read<CanonicalStation[]>("elecam-polling-stations.json");
const summary = read<Record<string, number>>("summary.json");
const displayNames = JSON.parse(
  readFileSync(join(data, "decisions/display-names.json"), "utf8"),
) as DisplayNames;

// Source ids in registry order; generated files refer to them by index.
const SOURCE_IDS = Object.keys(sources) as SourceId[];
const sourceIndex = (id: SourceId): number => {
  const i = SOURCE_IDS.indexOf(id);
  return i >= 0 ? i : fail(`unknown source id ${id}`);
};
const sortSources = (ids: Iterable<SourceId>): number[] =>
  [...new Set([...ids].map(sourceIndex))].sort((a, b) => a - b);

// ---------------------------------------------------------------------------
// Display names (decision D8)

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const ORDINAL = /^(.*?)[\s-]+(\d+)(?:er|re|e|st|nd|rd|th)?$/;
const displayByPcode = new Map<string, { fr: string; en: string }>();
for (const e of displayNames.entries)
  for (const pcode of e.pcodes) {
    if (normalizeName(e.fr) !== normalizeName(e.ocha))
      fail(`display name ${e.fr} does not fold to ${e.ocha}`);
    displayByPcode.set(pcode, { fr: e.fr, en: e.en ?? e.fr });
  }
const usedDisplay = new Set<string>();
const changedNames: string[] = [];

/** OCHA name → display name and ordinal, per D8. */
function arrondissementName(unit: CanonicalUnit): {
  fr: string;
  en: string;
  ordinal?: number;
} {
  const ocha = unit.name.fr;
  const match = ORDINAL.exec(ocha);
  let base = match?.[1] ?? ocha;
  let baseEn = base;
  const display = displayByPcode.get(unit.pcode);
  if (display) {
    usedDisplay.add(unit.pcode);
    if (normalizeName(display.fr) !== normalizeName(base))
      fail(`${unit.pcode}: ${display.fr} does not fold to ${base}`);
    base = display.fr;
    baseEn = display.en;
  }
  if (!match) return { fr: base, en: baseEn };
  const n = Number(match[2]);
  const roman = ROMAN[n] ?? fail(`${unit.pcode}: ordinal ${n} out of range`);
  // Only a series (Yaoundé I–VII) gets `ordinal`; "Akom II" is a plain name.
  const series = adm3.some(
    (u) =>
      u !== unit &&
      u.parentPcode === unit.parentPcode &&
      ORDINAL.exec(u.name.fr)?.[1] === match[1],
  );
  return {
    fr: `${base} ${roman}`,
    en: `${baseEn} ${roman}`,
    ...(series ? { ordinal: n } : {}),
  };
}

// ---------------------------------------------------------------------------
// Wikidata (see D8 in data/DECISIONS.md)
//
// `wikidata` (typed region / department / arrondissement items, all high
// confidence) is used as is. `wikidataCandidate` (ADM3 only) is used when the
// confidence is high or medium and the item is a commune: in Cameroon each
// arrondissement is exactly one commune. Low-confidence candidates and
// "locality or administrative-unit, manual scope check required" items are
// left out.
function wikidataOf(unit: CanonicalUnit): string | undefined {
  if (unit.wikidata) return unit.wikidata.qid;
  const c = unit.wikidataCandidate;
  if (!c || c.confidence === "low") return undefined;
  return /^(arrondissement|commune)\b/.test(c.entityScope) ? c.qid : undefined;
}

// ---------------------------------------------------------------------------
// Admin units

type AliasRow = [name: string, sources: number[], lang?: "fr" | "en"];
function groupAliases(aliases: CanonicalAlias[]): AliasRow[] {
  const byName = new Map<string, { ids: SourceId[]; langs: Set<string> }>();
  for (const a of aliases) {
    const g = byName.get(a.name) ?? { ids: [], langs: new Set<string>() };
    g.ids.push(a.source);
    if (a.lang) g.langs.add(a.lang);
    byName.set(a.name, g);
  }
  return [...byName].map(([name, g]) => {
    const row: AliasRow = [name, sortSources(g.ids)];
    if (g.langs.size === 1) row.push([...g.langs][0] as "fr" | "en");
    return row;
  });
}

const population = (p: CanonicalPopulation): number[] =>
  p.total === p.male + p.female
    ? [p.male, p.female]
    : [p.male, p.female, p.total];

let wikidataCount = 0;
function unitRow(unit: CanonicalUnit, level: 1 | 2 | 3) {
  const used: SourceId[] = ["ocha-cod-ab-cmr"];
  for (const a of unit.aliases) used.push(a.source);
  if (unit.population2005) used.push(unit.population2005.source);
  if (unit.hasc) used.push(unit.hasc.source);
  const wikidata = wikidataOf(unit);
  if (wikidata) {
    wikidataCount++;
    used.push("wikidata", "research-2026-10-17");
  }
  let name: { fr: string; en: string; ordinal?: number };
  if (level === 3) name = arrondissementName(unit);
  else name = { fr: unit.name.fr, en: unit.name.en ?? unit.name.fr };
  if (displayByPcode.has(unit.pcode) || name.fr !== unit.name.fr)
    used.push("research-2026-10-17");
  if (name.fr !== unit.name.fr)
    changedNames.push(`${unit.pcode} ${unit.name.fr} → ${name.fr}`);
  const bbox = unit.bbox ?? fail(`no bbox for ${unit.pcode}`);
  return {
    pcode: unit.pcode,
    name: name.en === name.fr ? [name.fr] : [name.fr, name.en],
    ...(name.ordinal !== undefined ? { ordinal: name.ordinal } : {}),
    refName: unit.refName,
    aliases: groupAliases(unit.aliases),
    ...(unit.hasc ? { hasc: unit.hasc.code } : {}),
    ...(wikidata ? { wikidata } : {}),
    areaSqKm: unit.areaSqKm,
    centroid: unit.centroid,
    bbox,
    ...(unit.population2005
      ? { population2005: population(unit.population2005) }
      : {}),
    sources: sortSources(used),
  };
}

const byPcode = <T extends { pcode: string }>(a: T, b: T) =>
  a.pcode < b.pcode ? -1 : a.pcode > b.pcode ? 1 : 0;
const admin = {
  sources: SOURCE_IDS,
  regions: [...adm1].sort(byPcode).map((u) => unitRow(u, 1)),
  divisions: [...adm2].sort(byPcode).map((u) => unitRow(u, 2)),
  arrondissements: [...adm3].sort(byPcode).map((u) => unitRow(u, 3)),
};
for (const pcode of displayByPcode.keys())
  if (!usedDisplay.has(pcode)) fail(`display name for unknown ${pcode}`);

// ---------------------------------------------------------------------------
// Cantons and villages: ids, parents and sources are derived at load time

const BUCREP: SourceId = "bucrep-rgph2005-repertoire-villages";
const byId = <T extends { id: string }>(a: T, b: T) =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
const pad = (n: number, width: number) => String(n).padStart(width, "0");

const cantonGroups = new Map<string, (string | number)[][]>();
for (const c of [...cantons].sort(byId)) {
  if (c.source.id !== BUCREP) fail(`${c.id}: unexpected source`);
  const rows = cantonGroups.get(c.adm3Pcode) ?? [];
  if (c.id !== `${c.adm3Pcode}-C${pad(rows.length + 1, 2)}`)
    fail(`canton ids are not sequential at ${c.id}`);
  rows.push([c.name, ...population(c.population2005)]);
  cantonGroups.set(c.adm3Pcode, rows);
}
const villageGroups = new Map<string, (string | number)[][]>();
for (const v of [...villages].sort(byId)) {
  if (v.source.id !== BUCREP) fail(`${v.id}: unexpected source`);
  if (!v.cantonId.startsWith(`${v.adm3Pcode}-`))
    fail(`${v.id}: canton outside its arrondissement`);
  const rows = villageGroups.get(v.cantonId) ?? [];
  if (v.id !== `${v.cantonId}-V${pad(rows.length + 1, 3)}`)
    fail(`village ids are not sequential at ${v.id}`);
  rows.push([v.name, ...population(v.population2005)]);
  villageGroups.set(v.cantonId, rows);
}

// ---------------------------------------------------------------------------
// ELECAM: runs of (arrondissement, council) → runs of centre → stations.
// The canonical order is kept.

type StationGroup = [
  pcode: string | null,
  council: string,
  centres: [centre: string, stations: [string, number][]][],
];
const stationGroups: StationGroup[] = [];
for (const s of stations) {
  let group = stationGroups.at(-1);
  if (!group || group[0] !== s.adm3Pcode || group[1] !== s.council) {
    group = [s.adm3Pcode, s.council, []];
    stationGroups.push(group);
  }
  let centre = group[2].at(-1);
  if (!centre || centre[0] !== s.centre) {
    centre = [s.centre, []];
    group[2].push(centre);
  }
  centre[1].push([s.station, s.registeredVoters]);
}
const councilSummaries = [...adm3]
  .sort(byPcode)
  .flatMap((u) =>
    u.elecam2025
      ? [
          [
            u.pcode,
            u.elecam2025.council,
            u.elecam2025.registeredVoters,
            u.elecam2025.pollingCentres,
            u.elecam2025.pollingStations,
          ],
        ]
      : [],
  );

// ---------------------------------------------------------------------------
// Metadata

const counts = {
  regions: admin.regions.length,
  divisions: admin.divisions.length,
  arrondissements: admin.arrondissements.length,
  cantons: cantons.length,
  villages: villages.length,
  pollingStations: stations.length,
};
const expected: Record<keyof typeof counts, string> = {
  regions: "adm1",
  divisions: "adm2",
  arrondissements: "adm3",
  cantons: "cantons",
  villages: "villages",
  pollingStations: "pollingStations",
};
for (const [k, key] of Object.entries(expected))
  if (counts[k as keyof typeof counts] !== summary[key])
    fail(`${k}: ${counts[k as keyof typeof counts]} ≠ summary ${summary[key]}`);

const usedSources = new Set<number>();
for (const level of [admin.regions, admin.divisions, admin.arrondissements])
  for (const u of level) for (const i of u.sources) usedSources.add(i);
usedSources.add(sourceIndex(BUCREP));
usedSources.add(sourceIndex("elecam-polling-stations-2025"));
const usedIds = [...usedSources]
  .sort((a, b) => a - b)
  .map((i) => SOURCE_IDS[i]);

const hash = createHash("sha256");
for (const file of [
  "adm1-regions.json",
  "adm2-divisions.json",
  "adm3-arrondissements.json",
  "cantons.json",
  "villages.json",
  "elecam-polling-stations.json",
]) {
  hash.update(file);
  hash.update(readFileSync(join(canonical, file)));
}
hash.update(readFileSync(join(data, "decisions/display-names.json")));
const canonicalSha256 = hash.digest("hex");
// The dataset date is the latest retrieval date of the sources used.
const generated = usedIds
  .map((id) => sources[id as SourceId].retrieved)
  .sort()
  .at(-1) as string;

const metadata = {
  name: "cameroon-locations",
  version: `${generated.replaceAll("-", ".")}+${canonicalSha256.slice(0, 8)}`,
  generated,
  sources: usedIds,
  counts,
  canonicalSha256,
};

// ---------------------------------------------------------------------------
// Write

mkdirSync(out, { recursive: true });
const write = (file: string, value: unknown, rows = false) => {
  // One top-level row per line keeps diffs readable without bloating size.
  let text: string;
  if (!rows) text = `${JSON.stringify(value, null, 2)}\n`;
  else {
    const obj = value as Record<string, unknown[]>;
    const parts = Object.entries(obj).map(([k, v]) =>
      Array.isArray(v) && v.length > 0 && typeof v[0] === "object"
        ? `${JSON.stringify(k)}:[\n${v.map((row) => JSON.stringify(row)).join(",\n")}\n]`
        : `${JSON.stringify(k)}:${JSON.stringify(v)}`,
    );
    text = `{\n${parts.join(",\n")}\n}\n`;
  }
  writeFileSync(join(out, file), text);
  return Buffer.byteLength(text);
};

const sizes = {
  "admin.json": write("admin.json", admin, true),
  "metadata.json": write("metadata.json", metadata),
  "cantons.json": write("cantons.json", { cantons: [...cantonGroups] }, true),
  "villages.json": write(
    "villages.json",
    { villages: [...villageGroups] },
    true,
  ),
  "elecam.json": write(
    "elecam.json",
    { stations: stationGroups, summaries: councilSummaries },
    true,
  ),
};

console.log("counts", counts);
console.log("wikidata ids", wikidataCount);
console.log(
  `display names changed: ${changedNames.length} (accent table: ${displayByPcode.size} arrondissements)`,
);
for (const [file, size] of Object.entries(sizes))
  console.log(`generated/${file}`, `${(size / 1024).toFixed(1)} KB`);
