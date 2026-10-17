/**
 * Build-time figures read from the `cameroon-locations` workspace package,
 * so the docs never drift from the data.
 */
import {
  arrondissements,
  divisions,
  metadata,
  regions,
} from "cameroon-locations";
import { cantons } from "cameroon-locations/cantons";
import { pollingStations } from "cameroon-locations/elecam";
import { villages } from "cameroon-locations/villages";

export const counts = {
  regions: regions.length,
  divisions: divisions.length,
  arrondissements: arrondissements.length,
  cantons: cantons.length,
  villages: villages.length,
  pollingStations: pollingStations.length,
} as const;

export const datasetVersion = metadata.version;

/** `1504` → `"1,504"`. */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}
