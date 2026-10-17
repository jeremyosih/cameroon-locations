import index from "../generated/geo-arrondissements.json";
import { arrondissements, divisions, regions } from "./data/admin";
import { EMPTY } from "./data/scope";
import { getUnit } from "./lookup";
import type { AdminLevel, AdminUnit, Arrondissement, LngLat } from "./types";

/**
 * Shape of `generated/geo-arrondissements.json` (written by `scripts/geo.ts`):
 * shared arcs quantised to `scale` degrees from `translate`, delta-encoded as
 * zigzag base64url varints; each unit lists its bbox (quantised) and the arcs
 * of all its rings.
 */
interface LocateIndex {
  readonly marginKm: number;
  readonly scale: number;
  readonly translate: readonly number[];
  readonly arcs: readonly string[];
  readonly units: readonly (readonly [
    pcode: string,
    bbox: readonly number[],
    rings: readonly (readonly number[])[],
  ])[];
}

interface DecodedUnit {
  readonly pcode: string;
  readonly bbox: readonly number[];
  readonly arcs: readonly number[];
}

const EARTH_RADIUS_KM = 6371.0088;
const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG_EQUATOR = 111.32;
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const data = index as unknown as LocateIndex;

let decoded:
  | { readonly arcs: readonly Int32Array[]; readonly units: DecodedUnit[] }
  | undefined;

function decodeArc(s: string, lookup: Int8Array): Int32Array {
  const out: number[] = [];
  let x = 0;
  let y = 0;
  let value = 0;
  let shift = 1;
  let odd = false;
  for (let i = 0; i < s.length; i++) {
    const c = lookup[s.charCodeAt(i)] ?? 0;
    value += (c & 31) * shift;
    if (c & 32) {
      shift *= 32;
      continue;
    }
    const v = value % 2 === 1 ? -(value + 1) / 2 : value / 2;
    if (odd) {
      y += v;
      out.push(x, y);
    } else {
      x += v;
    }
    odd = !odd;
    value = 0;
    shift = 1;
  }
  return Int32Array.from(out);
}

function load() {
  if (decoded) return decoded;
  const lookup = new Int8Array(128);
  for (let i = 0; i < ALPHABET.length; i++) lookup[ALPHABET.charCodeAt(i)] = i;
  decoded = {
    arcs: data.arcs.map((s) => decodeArc(s, lookup)),
    units: data.units.map(([pcode, bbox, rings]) => ({
      pcode,
      bbox,
      arcs: rings.flat(),
    })),
  };
  return decoded;
}

/**
 * Arrondissement containing a point (simplified OCHA polygons), if any.
 *
 * Returns `undefined` outside Cameroon, and within about 100 m of a border
 * (the simplification error), where the answer could be wrong.
 */
export function locate(point: LngLat): Arrondissement | undefined {
  const [lng, lat] = point;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  const { arcs, units } = load();
  const { marginKm, scale, translate } = data;
  // Work on the quantised grid; distances in km via a local flat projection.
  const px = (lng - (translate[0] ?? 0)) / scale;
  const py = (lat - (translate[1] ?? 0)) / scale;
  const kx = scale * KM_PER_DEG_LNG_EQUATOR * Math.cos((lat * Math.PI) / 180);
  const ky = scale * KM_PER_DEG_LAT;
  const pad = marginKm / Math.min(kx, ky);
  const margin2 = marginKm * marginKm;

  for (const unit of units) {
    const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = unit.bbox;
    if (px < x0 - pad || px > x1 + pad || py < y0 - pad || py > y1 + pad) {
      continue;
    }
    let inside = false;
    let near = false;
    for (const a of unit.arcs) {
      const c = arcs[a];
      if (!c) continue;
      for (let i = 2; i < c.length; i += 2) {
        const ax = c[i - 2] as number;
        const ay = c[i - 1] as number;
        const bx = c[i] as number;
        const by = c[i + 1] as number;
        if (
          ay > py !== by > py &&
          px < ((bx - ax) * (py - ay)) / (by - ay) + ax
        ) {
          inside = !inside;
        }
        if (
          !near &&
          segmentDistance2(px, py, ax, ay, bx, by, kx, ky) < margin2
        ) {
          near = true;
        }
      }
    }
    if (near) return undefined;
    if (inside) {
      const found = getUnit(unit.pcode);
      return found?.level === "arrondissement" ? found : undefined;
    }
  }
  return undefined;
}

/** Squared distance in km² from a point to a segment, on the quantised grid. */
function segmentDistance2(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  kx: number,
  ky: number,
): number {
  const dx = (bx - ax) * kx;
  const dy = (by - ay) * ky;
  const qx = (px - ax) * kx;
  const qy = (py - ay) * ky;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? Math.max(0, Math.min(1, (qx * dx + qy * dy) / len2)) : 0;
  const ex = qx - t * dx;
  const ey = qy - t * dy;
  return ex * ex + ey * ey;
}

/** Options of {@link nearest}. */
export interface NearestOptions {
  /** Level of the units returned. Default `"arrondissement"`. */
  readonly level?: AdminLevel | undefined;
  /** Default 5; `Infinity` returns every unit of the level. */
  readonly limit?: number | undefined;
}

/** One result of {@link nearest}. */
export interface NearestResult {
  readonly unit: AdminUnit;
  /** Great-circle distance from the point to the unit's centroid. */
  readonly distanceKm: number;
}

const POOLS: Readonly<Record<AdminLevel, readonly AdminUnit[]>> = {
  region: regions,
  division: divisions,
  arrondissement: arrondissements,
};

/**
 * Units sorted by centroid distance from a point. Ties are ordered by
 * P-code. The array and its entries are frozen.
 *
 * Never throws: a point with a non-finite coordinate, a `limit` below 1 (or
 * `NaN`) and an unknown `level` all return an empty array. A fractional
 * `limit` is rounded down.
 */
export function nearest(
  point: LngLat,
  options?: NearestOptions,
): readonly NearestResult[] {
  const level = options?.level ?? "arrondissement";
  const pool = Object.hasOwn(POOLS, level) ? POOLS[level] : undefined;
  const limit = options?.limit ?? 5;
  const [lng, lat] = point;
  if (
    !pool ||
    !(limit >= 1) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(lat)
  ) {
    return EMPTY;
  }
  const results = pool
    .map((unit) => ({ unit, distanceKm: distanceKm(point, unit.centroid) }))
    .sort(
      (a, b) =>
        a.distanceKm - b.distanceKm || a.unit.pcode.localeCompare(b.unit.pcode),
    )
    .slice(
      0,
      limit === Number.POSITIVE_INFINITY ? undefined : Math.floor(limit),
    );
  for (const r of results) Object.freeze(r);
  return Object.freeze(results);
}

/** Great-circle distance in kilometres (haversine, mean Earth radius). */
export function distanceKm(a: LngLat, b: LngLat): number {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
