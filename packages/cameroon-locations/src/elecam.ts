import data from "../generated/elecam.json";
import { EMPTY, isAdminPcode } from "./data/hydrate";
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

/** The 30,353 polling stations of the ELECAM July 2025 roll snapshot, in roll order. Deep-frozen. */
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
          }),
        ),
      ),
  ),
);

/** ELECAM totals for each of the 360 arrondissement councils, ordered by P-code. */
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
        }),
    ),
  );

let summaryByPcode: Map<Pcode, CouncilElectoralSummary> | undefined;
const byScope = new Map<string, readonly PollingStation[]>();

/** ELECAM totals for the council of an arrondissement. */
export function getCouncilSummary(
  arrondissementPcode: Pcode,
): CouncilElectoralSummary | undefined {
  summaryByPcode ??= new Map(
    councilSummaries.map((s) => [s.arrondissementPcode, s]),
  );
  return summaryByPcode.get(arrondissementPcode);
}

/** Stations in an arrondissement, division or region. `null` returns diaspora stations. */
export function getPollingStations(
  within: Pcode | null,
): readonly PollingStation[] {
  if (within !== null && !isAdminPcode(within)) return EMPTY;
  const key = within ?? "";
  let list = byScope.get(key);
  if (!list) {
    list = Object.freeze(
      pollingStations.filter((s) =>
        within === null
          ? s.arrondissementPcode === null
          : s.arrondissementPcode?.startsWith(within) === true,
      ),
    );
    byScope.set(key, list);
  }
  return list;
}
