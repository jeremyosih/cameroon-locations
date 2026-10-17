import { notImplemented } from "./internal";
import type { CouncilElectoralSummary, Pcode, PollingStation } from "./types";

export type { CouncilElectoralSummary, PollingStation } from "./types";

// Owner: data generation. ELECAM July 2025 snapshot.
export const pollingStations: readonly PollingStation[] = Object.freeze([]);
export const councilSummaries: readonly CouncilElectoralSummary[] =
  Object.freeze([]);

export function getCouncilSummary(
  _arrondissementPcode: Pcode,
): CouncilElectoralSummary | undefined {
  return notImplemented("getCouncilSummary");
}
/** Stations in an arrondissement, division or region. `null` returns diaspora stations. */
export function getPollingStations(
  _within: Pcode | null,
): readonly PollingStation[] {
  return notImplemented("getPollingStations");
}
