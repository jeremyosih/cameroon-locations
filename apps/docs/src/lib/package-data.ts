/**
 * Build-time figures read from the `cameroon-locations` workspace package,
 * so the docs never drift from the data. While the data PRs are in flight
 * the arrays can be empty; the documented totals are used then.
 */
import {
  arrondissements,
  divisions,
  metadata,
  regions,
} from "cameroon-locations";
import { cantons } from "cameroon-locations/cantons";
import { councilSummaries, pollingStations } from "cameroon-locations/elecam";
import { villages } from "cameroon-locations/villages";

const DOCUMENTED = {
  regions: 10,
  divisions: 58,
  arrondissements: 360,
  cantons: 1504,
  villages: 17070,
  pollingStations: 30353,
} as const;

function count(actual: number, documented: number): number {
  return actual > 0 ? actual : documented;
}

/** `true` once the generated datasets are wired into the package. */
export const hasData = regions.length > 0;

export const counts = {
  regions: count(regions.length, DOCUMENTED.regions),
  divisions: count(divisions.length, DOCUMENTED.divisions),
  arrondissements: count(arrondissements.length, DOCUMENTED.arrondissements),
  cantons: count(cantons.length, DOCUMENTED.cantons),
  villages: count(villages.length, DOCUMENTED.villages),
  pollingStations: count(pollingStations.length, DOCUMENTED.pollingStations),
  councils: councilSummaries.length,
} as const;

export const datasetVersion = metadata.version;

/** `1504` → `"1,504"`. */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}
