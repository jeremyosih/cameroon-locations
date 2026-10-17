import data from "../generated/elecam.json";
import { ELECAM_SOURCES } from "./data/hydrate";
import { EMPTY, isWithin, normalizeCode } from "./data/scope";
import type { CouncilElectoralSummary, Pcode, PollingStation } from "./types";

export type { CouncilElectoralSummary, PollingStation } from "./types";

type StationGroup = readonly [
  arrondissementPcode: string | null,
  council: string,
  centres: readonly (readonly [
    centre: string,
    stations: readonly (readonly [station: string, voters: number])[],
  ])[],
];
type SummaryRow = readonly [
  arrondissementPcode: string,
  council: string,
  registeredVoters: number,
  pollingCentres: number,
  pollingStations: number,
];

/**
 * The 30,353 polling stations of the ELECAM 2025 roll (probably the July 2025
 * provisional roll), in roll order. Deep-frozen.
 */
export const pollingStations: readonly PollingStation[] = Object.freeze(
  (data.stations as unknown as readonly StationGroup[]).flatMap(
    ([arrondissementPcode, council, centres]) =>
      centres.flatMap(([centre, stations]) =>
        stations.map(([station, registeredVoters]) =>
          Object.freeze<PollingStation>({
            arrondissementPcode,
            council,
            centre,
            station,
            registeredVoters,
            sources: ELECAM_SOURCES,
          }),
        ),
      ),
  ),
);

/**
 * ELECAM totals for each of the 360 arrondissement councils, ordered by
 * P-code. `registeredVoters` is the sum over the council's stations.
 */
export const councilSummaries: readonly CouncilElectoralSummary[] =
  Object.freeze(
    (data.summaries as unknown as readonly SummaryRow[]).map(
      ([
        arrondissementPcode,
        council,
        registeredVoters,
        pollingCentres,
        pollingStations,
      ]) =>
        Object.freeze<CouncilElectoralSummary>({
          arrondissementPcode,
          council,
          registeredVoters,
          pollingCentres,
          pollingStations,
          sources: ELECAM_SOURCES,
        }),
    ),
  );

let summaryByPcode: Map<Pcode, CouncilElectoralSummary> | undefined;
const byScope = new Map<string, readonly PollingStation[]>();

/**
 * ELECAM totals for the council of an arrondissement, by P-code (case and
 * surrounding whitespace ignored).
 */
export function getCouncilSummary(
  arrondissementPcode: Pcode,
): CouncilElectoralSummary | undefined {
  summaryByPcode ??= new Map(
    councilSummaries.map((s) => [s.arrondissementPcode, s]),
  );
  return summaryByPcode.get(normalizeCode(arrondissementPcode));
}

/**
 * Stations in an arrondissement, division or region, by P-code (case and
 * surrounding whitespace ignored). `null` returns the diaspora stations.
 * Anything else, including a name or a partial code, returns an empty array.
 */
export function getPollingStations(
  within: Pcode | null,
): readonly PollingStation[] {
  const scope = within === null ? null : normalizeCode(within);
  const key = scope ?? "";
  const cached = byScope.get(key);
  if (cached) return cached;
  const list = pollingStations.filter((s) =>
    scope === null
      ? s.arrondissementPcode === null
      : s.arrondissementPcode !== null &&
        isWithin(s.arrondissementPcode, scope),
  );
  if (!list.length) return EMPTY;
  Object.freeze(list);
  byScope.set(key, list);
  return list;
}
