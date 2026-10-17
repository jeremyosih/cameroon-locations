import { notImplemented } from "./internal";
import type { AdminLevel, AdminUnit, Arrondissement, LngLat } from "./types";

/** Arrondissement containing a point (simplified OCHA polygons), if any. */
export function locate(_point: LngLat): Arrondissement | undefined {
  return notImplemented("locate");
}

/** Units sorted by centroid distance from a point. */
export function nearest(
  _point: LngLat,
  _options?: { readonly level?: AdminLevel; readonly limit?: number },
): readonly { readonly unit: AdminUnit; readonly distanceKm: number }[] {
  return notImplemented("nearest");
}

/** Great-circle distance in kilometres. */
export function distanceKm(_a: LngLat, _b: LngLat): number {
  return notImplemented("distanceKm");
}
