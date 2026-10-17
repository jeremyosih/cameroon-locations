/**
 * Builds the published map files and the polygon index behind `locate()`
 * from the OCHA COD-AB ADM3 layer (`bun run data:geo`).
 *
 * Inputs (Git LFS, run `git lfs pull` first):
 *   data/sources/ocha-cod-ab-cmr/extracted/geojson/cmr_admin3.geojson
 *   data/canonical/adm{1,2,3}-*.json, or generated/*.json for display names
 *
 * Outputs:
 *   geojson/{country,regions,divisions,arrondissements}{.low,,.high}.geojson
 *   geojson/cameroon.topojson, geojson/README.md
 *   generated/geo-arrondissements.json
 *
 * Every level is dissolved from the simplified arrondissements, so the
 * levels nest exactly and share their borders. The output is deterministic:
 * same inputs, same bytes.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { attribution, getSources, REPOSITORY_URL } from "../src/sources";

interface Mapshaper {
  applyCommands(
    commands: string,
    input: Record<string, string>,
  ): Promise<Record<string, Buffer | string>>;
}
const mapshaper = createRequire(import.meta.url)("mapshaper") as Mapshaper;

const pkgDir = join(import.meta.dir, "..");
const root = join(pkgDir, "../..");
const sourceFile = join(
  root,
  "data/sources/ocha-cod-ab-cmr/extracted/geojson/cmr_admin3.geojson",
);
const outDir = join(pkgDir, "geojson");
const generatedDir = join(pkgDir, "generated");
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")) as {
  name: string;
  version: string;
};

type Level = "country" | "region" | "division" | "arrondissement";
type Pos = [number, number];

const layers = [
  { file: "country", level: "country", layer: "country" },
  { file: "regions", level: "region", layer: "regions" },
  { file: "divisions", level: "division", layer: "divisions" },
  {
    file: "arrondissements",
    level: "arrondissement",
    layer: "arrondissements",
  },
] as const satisfies readonly { file: string; level: Level; layer: string }[];

/**
 * Visvalingam (weighted) tolerance in metres, per detail. Picked by rendering
 * each level: "low" keeps the country shape and every arrondissement
 * recognisable on a phone-sized overview map, "default" holds up to about
 * zoom 9 (a region on screen), "high" to about zoom 11 (a city).
 */
const details = [
  { suffix: ".low", name: "low", interval: 4000, decimals: 4 },
  { suffix: "", name: "default", interval: 700, decimals: 5 },
  { suffix: ".high", name: "high", interval: 220, decimals: 5 },
] as const;

/**
 * `locate()` polygons: Douglas-Peucker, so that no original boundary point
 * is further than `LOCATE_INTERVAL_M` from the simplified one. Points closer
 * than that (plus the quantisation error) to a border return `undefined`.
 */
const LOCATE_INTERVAL_M = 100;
const LOCATE_SCALE = 1e-4;
const LOCATE_TRANSLATE: Pos = [8, 1];

// --- Inputs -----------------------------------------------------------------

if (!existsSync(sourceFile)) {
  throw new Error(`Missing ${sourceFile}. Run \`git lfs pull\`.`);
}
const sourceText = readFileSync(sourceFile, "utf8");
if (sourceText.startsWith("version https://git-lfs")) {
  throw new Error(`${sourceFile} is a Git LFS pointer. Run \`git lfs pull\`.`);
}

interface NamedUnit {
  pcode: string;
  parentPcode: string | null;
  name: { fr: string; en?: string };
}

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;

const canonical = [
  "adm1-regions.json",
  "adm2-divisions.json",
  "adm3-arrondissements.json",
].flatMap((f) => readJson<NamedUnit[]>(join(root, "data/canonical", f)));
const units = new Map(canonical.map((u) => [u.pcode, u]));

/**
 * Display names from the package's generated records when they exist (they
 * apply the naming conventions of D8), otherwise from the canonical data.
 */
function displayNames(): Map<string, { fr: string; en: string }> {
  const names = new Map<string, { fr: string; en: string }>();
  for (const u of canonical) {
    names.set(u.pcode, { fr: u.name.fr, en: u.name.en ?? u.name.fr });
  }
  if (!existsSync(generatedDir)) return names;
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const v of value) visit(v);
      return;
    }
    if (value === null || typeof value !== "object") return;
    const o = value as Record<string, unknown>;
    const name = o.name as { fr?: unknown; en?: unknown } | undefined;
    if (
      typeof o.pcode === "string" &&
      units.has(o.pcode) &&
      typeof name?.fr === "string"
    ) {
      names.set(o.pcode, {
        fr: name.fr,
        en: typeof name.en === "string" ? name.en : name.fr,
      });
      return;
    }
    for (const v of Object.values(o)) visit(v);
  };
  const files = readdirSync(generatedDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("geo-"))
    .sort();
  for (const f of files) visit(readJson(join(generatedDir, f)));
  return names;
}
const names = displayNames();

function properties(level: Level, pcode: string) {
  if (level === "country") {
    return {
      pcode,
      level,
      name_fr: "Cameroun",
      name_en: "Cameroon",
      parentPcode: null,
    };
  }
  const unit = units.get(pcode);
  const name = names.get(pcode);
  if (!unit || !name) throw new Error(`${pcode} is not in data/canonical`);
  const base = {
    pcode,
    level,
    name_fr: name.fr,
    name_en: name.en,
    parentPcode: level === "region" ? null : unit.parentPcode,
  };
  if (level === "region") return base;
  if (level === "division") return { ...base, regionPcode: pcode.slice(0, 5) };
  return {
    ...base,
    regionPcode: pcode.slice(0, 5),
    divisionPcode: pcode.slice(0, 8),
  };
}

// --- Metadata ---------------------------------------------------------------

const ochaSources = getSources(["ocha-cod-ab-cmr"]);

function metadata(extra: Record<string, unknown>) {
  return {
    name: pkg.name,
    version: pkg.version,
    repository: REPOSITORY_URL,
    license:
      "Boundaries derived from OCHA COD-AB Cameroon (INC / OCHA), CC BY-IGO 3.0: attribution required. Package code: MIT.",
    attribution: attribution(["ocha-cod-ab-cmr"]),
    notice: `${REPOSITORY_URL}/blob/main/NOTICE.md`,
    sources: ochaSources,
    ...extra,
  };
}

// --- Map files --------------------------------------------------------------

const dissolve = [
  "-each 'pcode=adm3_pcode' target=arrondissements",
  "-dissolve2 adm2_pcode + name=divisions target=arrondissements",
  "-each 'pcode=adm2_pcode' target=divisions",
  "-dissolve2 adm1_pcode + name=regions target=arrondissements",
  "-each 'pcode=adm1_pcode' target=regions",
  "-dissolve2 + name=country target=arrondissements",
  "-each 'pcode=\"CM\"' target=country",
  "-filter-fields pcode target=*",
].join(" ");

interface Feature {
  type: "Feature";
  id?: string;
  properties: { pcode: string } & Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

const text = (b: Buffer | string | undefined, name: string): string => {
  if (b === undefined) throw new Error(`mapshaper produced no ${name}`);
  return b.toString();
};

/** One feature per line: small diffs, still compact. */
function featureCollection(
  meta: Record<string, unknown>,
  features: Feature[],
): string {
  const head = JSON.stringify({ type: "FeatureCollection", metadata: meta });
  return `${head.slice(0, -1)},"features":[\n${features
    .map((f) => JSON.stringify(f))
    .join(",\n")}\n]}\n`;
}

const sizes: { file: string; level: string; detail: string; bytes: number }[] =
  [];
const counts: Record<string, number> = {};

for (const detail of details) {
  const outputs = await mapshaper.applyCommands(
    [
      "-i adm3.json name=arrondissements",
      `-simplify weighted interval=${detail.interval} keep-shapes`,
      dissolve,
      `-o format=geojson precision=${10 ** -detail.decimals} target=*`,
      ...(detail.name === "default"
        ? ["-o cameroon.topojson format=topojson id-field=pcode target=*"]
        : []),
    ].join(" "),
    { "adm3.json": sourceText },
  );

  for (const { file, level, layer } of layers) {
    const fc = JSON.parse(text(outputs[`${layer}.json`], layer)) as {
      features: Feature[];
    };
    const features = fc.features
      .map((f): Feature => {
        const pcode = f.properties.pcode;
        return {
          type: "Feature",
          id: pcode,
          properties: properties(level, pcode),
          geometry: f.geometry,
        };
      })
      .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""));
    counts[level] = features.length;
    const name = `${file}${detail.suffix}.geojson`;
    const body = featureCollection(
      metadata({
        level,
        detail: detail.name,
        simplification: `mapshaper ${mapshaperVersion()}, Visvalingam weighted, interval ${detail.interval} m, topology preserved; coordinates rounded to ${detail.decimals} decimals`,
      }),
      features,
    );
    writeFileSync(join(outDir, name), body);
    sizes.push({ file: name, level, detail: detail.name, bytes: body.length });
  }

  const topoText = outputs["cameroon.topojson"];
  if (topoText !== undefined) {
    const topo = JSON.parse(topoText.toString()) as {
      type: "Topology";
      objects: Record<
        string,
        { geometries: { id?: string; properties?: Record<string, unknown> }[] }
      >;
    } & Record<string, unknown>;
    const objects: typeof topo.objects = {};
    for (const { level, layer } of layers) {
      const obj = topo.objects[layer];
      if (!obj) throw new Error(`TopoJSON has no ${layer} object`);
      for (const g of obj.geometries) {
        g.properties = properties(level, g.id ?? "");
      }
      obj.geometries.sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""));
      objects[layer] = obj;
    }
    const { type: _t, objects: _o, ...rest } = topo;
    const body = `${JSON.stringify({
      type: "Topology",
      metadata: metadata({
        levels: layers.map((l) => l.layer),
        detail: detail.name,
        simplification: `mapshaper ${mapshaperVersion()}, Visvalingam weighted, interval ${detail.interval} m, topology preserved; quantized TopoJSON`,
      }),
      ...rest,
      objects,
    })}\n`;
    writeFileSync(join(outDir, "cameroon.topojson"), body);
    sizes.push({
      file: "cameroon.topojson",
      level: "all four, shared arcs",
      detail: detail.name,
      bytes: body.length,
    });
  }
}

const expected = { country: 1, region: 10, division: 58, arrondissement: 360 };
for (const [level, n] of Object.entries(expected)) {
  if (counts[level] !== n) {
    throw new Error(`${level}: ${counts[level]} features, expected ${n}`);
  }
}

function mapshaperVersion(): string {
  return (
    readJson<{ version: string }>(
      join(pkgDir, "node_modules/mapshaper/package.json"),
    ).version ?? "?"
  );
}

// --- locate() index ---------------------------------------------------------

/**
 * Arcs are quantised to a 1e-4 degree grid and delta-encoded, then written as
 * zigzag varints in base64url (5 bits per character, the 6th bit marks a
 * continuation). Rings list arc indices; the direction of an arc does not
 * matter for even-odd point-in-polygon tests, so `~i` is stored as `i`.
 */
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encodeInts(values: number[]): string {
  let out = "";
  for (const v of values) {
    let z = v < 0 ? -2 * v - 1 : 2 * v;
    do {
      const chunk = z & 31;
      z = Math.floor(z / 32);
      out += ALPHABET[chunk | (z > 0 ? 32 : 0)];
    } while (z > 0);
  }
  return out;
}

const locateOut = await mapshaper.applyCommands(
  [
    "-i adm3.json name=arrondissements",
    "-each 'pcode=adm3_pcode' -filter-fields pcode",
    `-simplify dp interval=${LOCATE_INTERVAL_M} keep-shapes`,
    "-o out.json format=topojson no-quantization id-field=pcode",
  ].join(" "),
  { "adm3.json": sourceText },
);
const locateTopo = JSON.parse(text(locateOut["out.json"], "locate index")) as {
  arcs: Pos[][];
  objects: Record<
    string,
    {
      geometries: (
        | { type: "Polygon"; id: string; arcs: number[][] }
        | { type: "MultiPolygon"; id: string; arcs: number[][][] }
      )[];
    }
  >;
};

const quantArcs = locateTopo.arcs.map((arc) => {
  const q: Pos[] = [];
  for (const [x, y] of arc) {
    const p: Pos = [
      Math.round((x - LOCATE_TRANSLATE[0]) / LOCATE_SCALE),
      Math.round((y - LOCATE_TRANSLATE[1]) / LOCATE_SCALE),
    ];
    const last = q[q.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) q.push(p);
  }
  return q;
});
const encodedArcs = quantArcs.map((arc) => {
  const deltas: number[] = [];
  let px = 0;
  let py = 0;
  for (const [x, y] of arc) {
    deltas.push(x - px, y - py);
    px = x;
    py = y;
  }
  return encodeInts(deltas);
});

const geoms = Object.values(locateTopo.objects)[0]?.geometries ?? [];
const indexUnits = geoms
  .map((g) => {
    const rings = g.type === "Polygon" ? g.arcs : g.arcs.flat();
    const refs = rings.map((r) => r.map((i) => (i < 0 ? ~i : i)));
    const bbox = [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];
    for (const i of refs.flat()) {
      for (const [x, y] of quantArcs[i] ?? []) {
        bbox[0] = Math.min(bbox[0] as number, x);
        bbox[1] = Math.min(bbox[1] as number, y);
        bbox[2] = Math.max(bbox[2] as number, x);
        bbox[3] = Math.max(bbox[3] as number, y);
      }
    }
    return [g.id, bbox, refs] as const;
  })
  .sort((a, b) => a[0].localeCompare(b[0]));
if (indexUnits.length !== 360) {
  throw new Error(`locate index: ${indexUnits.length} units, expected 360`);
}

// Worst-case distance between the stored and the original border, in km.
const marginKm =
  LOCATE_INTERVAL_M / 1000 + Math.SQRT1_2 * LOCATE_SCALE * 111.32 * 1.01;
const index = {
  source: "ocha-cod-ab-cmr cmr_admin3.geojson",
  simplification: `mapshaper ${mapshaperVersion()}, Douglas-Peucker, interval ${LOCATE_INTERVAL_M} m, topology preserved`,
  marginKm: Math.round(marginKm * 1000) / 1000,
  scale: LOCATE_SCALE,
  translate: LOCATE_TRANSLATE,
  arcs: encodedArcs,
  units: indexUnits,
};
const indexBody = `${JSON.stringify(index)}\n`;
writeFileSync(join(generatedDir, "geo-arrondissements.json"), indexBody);

// --- README -----------------------------------------------------------------

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
const rows = sizes
  .slice()
  .sort((a, b) => a.file.localeCompare(b.file))
  .map((s) => `| \`${s.file}\` | ${s.level} | ${s.detail} | ${kb(s.bytes)} |`);
const intervals = details.map((d) => `${d.name} ${d.interval} m`).join(", ");
writeFileSync(
  join(outDir, "README.md"),
  `# GeoJSON

Simplified OCHA COD-AB boundaries of Cameroon, generated by
\`bun run data:geo\` (\`scripts/geo.ts\`). Do not edit by hand.

| File | Level | Detail | Size |
|---|---|---|---|
${rows.join("\n")}

- Detail: Visvalingam (weighted) simplification with topology preserved
  (${intervals}). All levels are dissolved from the same simplified
  arrondissements, so borders nest and match exactly. Use \`low\` for
  overview maps and small screens, the default up to about zoom 9, \`high\`
  when zoomed in to a city.
- GeoJSON follows RFC 7946: WGS 84 longitude/latitude, counter-clockwise
  outer rings, coordinates rounded to 5 decimals (4 in \`low\` files, about
  11 m). d3-geo expects the opposite winding; d3 users should prefer \`cameroon.topojson\` (objects
  \`country\`, \`regions\`, \`divisions\`, \`arrondissements\`; use
  \`topojson-client\`'s \`feature()\` / \`mesh()\`).
- Feature \`id\` is the OCHA P-code, so features join to the package's
  records with \`getUnit(feature.id)\`. \`properties\`: \`pcode\`, \`level\`,
  \`name_fr\`, \`name_en\`, \`parentPcode\`, plus \`regionPcode\` and
  \`divisionPcode\` where they apply.
- Each file has a top-level \`metadata\` member with the version, licence
  and sources (online URL and archived copy in this repository).

\`\`\`js
import regions from "cameroon-locations/geojson/regions.geojson" with { type: "json" };
// or fetch("https://unpkg.com/cameroon-locations/geojson/regions.geojson")
\`\`\`

## Attribution

${attribution(["ocha-cod-ab-cmr"])} Source: ${ochaSources[0]?.url}; archived
copy: ${ochaSources[0]?.repositoryUrl}. Via cameroon-locations. See
[NOTICE.md](${REPOSITORY_URL}/blob/main/NOTICE.md).
`,
);

for (const s of sizes) console.log(`${s.file.padEnd(34)} ${kb(s.bytes)}`);
console.log(
  `${"generated/geo-arrondissements.json".padEnd(34)} ${kb(indexBody.length)}`,
);
