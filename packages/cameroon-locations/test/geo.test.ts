import { describe, expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { metadata as datasetMetadata } from "../src/data/metadata";
import { distanceKm, locate, nearest } from "../src/geo";
import { getUnit } from "../src/lookup";
import { sources } from "../src/sources";
import type { AdminLevel, LngLat } from "../src/types";

const pkgDir = join(import.meta.dir, "..");
const geojsonDir = join(pkgDir, "geojson");
const canonicalDir = join(pkgDir, "../../data/canonical");

type Ring = [number, number][];
interface Feature {
  type: "Feature";
  id: string;
  properties: Record<string, unknown> & { pcode: string; level: string };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
}
interface Collection {
  type: "FeatureCollection";
  metadata: {
    name: string;
    version: string;
    repository: string;
    attribution: string;
    sources: { id: string; url: string; repositoryUrl: string }[];
  };
  features: Feature[];
}

const read = <T>(path: string): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;

const canonical = new Map<string, number>(
  [
    "adm1-regions.json",
    "adm2-divisions.json",
    "adm3-arrondissements.json",
  ].flatMap((f) =>
    read<{ pcode: string; level: number }[]>(join(canonicalDir, f)).map(
      (u) => [u.pcode, u.level] as const,
    ),
  ),
);

const files = [
  { file: "country", level: "country", depth: 0, count: 1 },
  { file: "regions", level: "region", depth: 1, count: 10 },
  { file: "divisions", level: "division", depth: 2, count: 58 },
  { file: "arrondissements", level: "arrondissement", depth: 3, count: 360 },
] as const;
const details = [".low", "", ".high"] as const;

/** Twice the signed area: positive for counter-clockwise rings. */
const signedArea = (ring: Ring) => {
  let s = 0;
  for (let i = 1; i < ring.length; i++) {
    const [ax, ay] = ring[i - 1] as [number, number];
    const [bx, by] = ring[i] as [number, number];
    s += ax * by - bx * ay;
  }
  return s;
};

describe("GeoJSON files", () => {
  for (const { file, level, depth, count } of files) {
    for (const detail of details) {
      const name = `${file}${detail}.geo.json`;
      test(`${name}: ${count} ${level} features joined by P-code`, () => {
        const fc = read<Collection>(join(geojsonDir, name));
        expect(fc.type).toBe("FeatureCollection");
        expect("crs" in fc).toBe(false);
        expect(fc.features).toHaveLength(count);
        const seen = new Set<string>();
        for (const f of fc.features) {
          const { pcode } = f.properties;
          expect(f.id).toBe(pcode);
          expect(f.properties.level).toBe(level);
          expect(f.properties.name_fr).toBeString();
          expect(f.properties.name_en).toBeString();
          if (depth > 0) expect(canonical.get(pcode)).toBe(depth);
          else expect(pcode).toBe("CM");
          if (depth === 3) {
            expect(f.properties.divisionPcode).toBe(pcode.slice(0, 8));
            expect(f.properties.regionPcode).toBe(pcode.slice(0, 5));
            expect(f.properties.parentPcode).toBe(pcode.slice(0, 8));
          }
          if (depth === 2)
            expect(f.properties.parentPcode).toBe(pcode.slice(0, 5));
          if (depth <= 1) expect(f.properties.parentPcode).toBeNull();
          seen.add(pcode);
          // RFC 7946: lon/lat in range, CCW exterior rings, CW holes.
          const polygons =
            f.geometry.type === "Polygon"
              ? [f.geometry.coordinates]
              : f.geometry.coordinates;
          for (const [outer, ...holes] of polygons) {
            expect(signedArea(outer as Ring)).toBeGreaterThan(0);
            for (const h of holes) expect(signedArea(h)).toBeLessThan(0);
            for (const [lng, lat] of outer as Ring) {
              expect(lng).toBeWithin(8, 17);
              expect(lat).toBeWithin(1, 14);
            }
          }
        }
        expect(seen.size).toBe(count);
      });

      test(`${name}: metadata with sources and attribution`, () => {
        const { metadata } = read<Collection>(join(geojsonDir, name));
        expect(metadata.name).toBe("cameroon-locations");
        // Same dataset version as the package's `metadata` (re-run data:geo if not).
        expect(metadata.version).toBe(datasetMetadata.version);
        expect(metadata.attribution).toContain("OCHA");
        const ocha = metadata.sources.find((s) => s.id === "ocha-cod-ab-cmr");
        expect(ocha?.url).toBe(sources["ocha-cod-ab-cmr"].url);
        expect(ocha?.repositoryUrl).toBe(
          sources["ocha-cod-ab-cmr"].repositoryUrl,
        );
      });
    }

    test(`${file}: low < default < high in size`, () => {
      const size = (d: string) =>
        statSync(join(geojsonDir, `${file}${d}.geo.json`)).size;
      expect(size(".low")).toBeLessThan(size(""));
      expect(size("")).toBeLessThan(size(".high"));
    });
  }

  test("feature names match the package records (re-run data:geo if not)", () => {
    const mismatches: string[] = [];
    for (const { file, depth } of files) {
      if (depth === 0) continue;
      for (const detail of details) {
        const fc = read<Collection>(
          join(geojsonDir, `${file}${detail}.geo.json`),
        );
        for (const f of fc.features) {
          const unit = getUnit(f.id);
          const { name_fr, name_en } = f.properties;
          if (unit?.name.fr !== name_fr || unit?.name.en !== name_en) {
            mismatches.push(
              `${file}${detail} ${f.id}: ${name_fr} / ${name_en}`,
            );
          }
        }
      }
      const topo = read<{
        objects: Record<
          string,
          { geometries: { id: string; properties: Record<string, unknown> }[] }
        >;
      }>(join(geojsonDir, "cameroon.topo.json"));
      for (const g of topo.objects[file]?.geometries ?? []) {
        const unit = getUnit(g.id);
        if (
          unit?.name.fr !== g.properties.name_fr ||
          unit?.name.en !== g.properties.name_en
        ) {
          mismatches.push(`topojson ${g.id}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  test("cameroon.topo.json has every level, with P-code ids", () => {
    const topo = read<{
      type: string;
      metadata: Collection["metadata"];
      objects: Record<string, { geometries: { id: string }[] }>;
    }>(join(geojsonDir, "cameroon.topo.json"));
    expect(topo.type).toBe("Topology");
    expect(topo.metadata.sources[0]?.id).toBe("ocha-cod-ab-cmr");
    expect(topo.metadata.version).toBe(datasetMetadata.version);
    for (const { file, depth, count } of files) {
      const geoms = topo.objects[file]?.geometries ?? [];
      expect(geoms).toHaveLength(count);
      for (const g of geoms) {
        if (depth > 0) expect(canonical.get(g.id)).toBe(depth);
      }
    }
  });
});

describe("locate", () => {
  test("Yaoundé city centre is in an arrondissement of Mfoundi", () => {
    const unit = locate([11.5167, 3.8667]);
    expect(unit?.level).toBe("arrondissement");
    expect(unit?.pcode).toStartWith("CM002007");
  });

  test("Douala is in Wouri (Littoral)", () => {
    expect(locate([9.7043, 4.0511])?.pcode).toStartWith("CM005004");
  });

  test("points outside Cameroon return undefined", () => {
    const outside: LngLat[] = [
      [9.3, 2.6], // Gulf of Guinea, off Kribi
      [13.16, 11.83], // Maiduguri, Nigeria (inside Cameroon's bbox)
      [12.48, 9.21], // Yola, Nigeria
      [15.05, 12.11], // N'Djamena, Chad, across the Chari from Kousseri
      [0, 0],
      [Number.NaN, 4],
    ];
    for (const p of outside) expect(locate(p)).toBeUndefined();
  });

  test("points on a shared border return undefined", () => {
    // A vertex shared by two neighbouring arrondissements.
    const fc = read<Collection>(
      join(geojsonDir, "arrondissements.high.geo.json"),
    );
    const owners = new Map<string, Set<string>>();
    for (const f of fc.features) {
      const rings =
        f.geometry.type === "Polygon"
          ? f.geometry.coordinates
          : f.geometry.coordinates.flat();
      for (const r of rings) {
        for (const [x, y] of r) {
          const k = `${x},${y}`;
          const s = owners.get(k) ?? new Set();
          s.add(f.id);
          owners.set(k, s);
        }
      }
    }
    const shared = [...owners].filter(([, s]) => s.size >= 2);
    expect(shared.length).toBeGreaterThan(1000);
    for (let i = 0; i < shared.length; i += Math.floor(shared.length / 200)) {
      const [x, y] = (shared[i]?.[0] ?? "").split(",").map(Number);
      expect(locate([x as number, y as number])).toBeUndefined();
    }
  });

  test("agrees with the high-detail polygons away from borders", () => {
    const fc = read<Collection>(
      join(geojsonDir, "arrondissements.high.geo.json"),
    );
    const contains = (f: Feature, x: number, y: number) => {
      const rings =
        f.geometry.type === "Polygon"
          ? f.geometry.coordinates
          : f.geometry.coordinates.flat();
      let inside = false;
      for (const r of rings) {
        for (let i = 1; i < r.length; i++) {
          const [ax, ay] = r[i - 1] as [number, number];
          const [bx, by] = r[i] as [number, number];
          if (
            ay > y !== by > y &&
            x < ((bx - ax) * (y - ay)) / (by - ay) + ax
          ) {
            inside = !inside;
          }
        }
      }
      return inside;
    };
    let inCountry = 0;
    let answered = 0;
    let disagree = 0;
    for (let x = 8.45; x < 16.25; x += 0.1) {
      for (let y = 1.65; y < 13.1; y += 0.1) {
        const truth = fc.features.find((f) => contains(f, x, y))?.id;
        const got = locate([x, y])?.pcode;
        if (truth) inCountry++;
        if (got) answered++;
        if (got && got !== truth) disagree++;
      }
    }
    expect(inCountry).toBeGreaterThan(3500);
    expect(answered / inCountry).toBeGreaterThan(0.97);
    expect(disagree / answered).toBeLessThan(0.002);
  });
});

describe("nearest", () => {
  const yaounde: LngLat = [11.5167, 3.8667];

  test("returns units of the requested level, sorted by distance", () => {
    const res = nearest(yaounde, { level: "region", limit: 3 });
    expect(res).toHaveLength(3);
    expect(res[0]?.unit.pcode).toBe("CM002");
    for (const r of res) expect(r.unit.level).toBe("region");
    for (let i = 1; i < res.length; i++) {
      expect(res[i]?.distanceKm).toBeGreaterThanOrEqual(
        res[i - 1]?.distanceKm ?? 0,
      );
    }
  });

  test("defaults to the 5 nearest arrondissements", () => {
    const res = nearest(yaounde);
    expect(res).toHaveLength(5);
    for (const r of res) {
      expect(r.unit.level).toBe("arrondissement");
      expect(r.unit.pcode).toStartWith("CM002007");
    }
    expect(nearest(yaounde, { limit: Number.POSITIVE_INFINITY })).toHaveLength(
      360,
    );
  });

  test("never throws: bad points, limits and levels return []", () => {
    expect(nearest([Number.NaN, 3.8])).toEqual([]);
    expect(nearest([11.5, Number.POSITIVE_INFINITY])).toEqual([]);
    for (const limit of [0, -1, 0.5, Number.NaN, Number.NEGATIVE_INFINITY])
      expect(nearest(yaounde, { limit })).toEqual([]);
    expect(nearest(yaounde, { level: "toString" as AdminLevel })).toEqual([]);
    expect(nearest(yaounde, { limit: 2.9 })).toHaveLength(2);
    expect(
      nearest(yaounde, { level: undefined, limit: undefined }),
    ).toHaveLength(5);
  });

  test("results are frozen", () => {
    const res = nearest(yaounde);
    expect(Object.isFrozen(res)).toBe(true);
    expect(res.every(Object.isFrozen)).toBe(true);
  });
});

describe("distanceKm", () => {
  test("Yaoundé to Douala is about 200 km as the crow flies", () => {
    const d = distanceKm([11.5167, 3.8667], [9.7043, 4.0511]);
    expect(d).toBeWithin(200, 240);
  });

  test("is symmetric and zero for the same point", () => {
    const a: LngLat = [14.3, 10.6];
    const b: LngLat = [9.2, 4.15];
    expect(distanceKm(a, a)).toBe(0);
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 9);
  });
});
