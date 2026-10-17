import type { SourceId, SourceInfo } from "./types";

export const REPOSITORY_URL =
  "https://github.com/jeremyosih/cameroon-locations";

const repo = (id: string) => `${REPOSITORY_URL}/tree/main/data/sources/${id}`;

const sourceList: Record<SourceId, SourceInfo> = {
  "ocha-cod-ab-cmr": {
    id: "ocha-cod-ab-cmr",
    title: "Cameroon - Subnational Administrative Boundaries (COD-AB), v01",
    publisher:
      "OCHA / HDX, produced by Institut National de Cartographie (INC)",
    license: "CC BY-IGO 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/igo/",
    url: "https://data.humdata.org/dataset/cod-ab-cmr",
    repositoryUrl: repo("ocha-cod-ab-cmr"),
    retrieved: "2026-10-17",
    attribution:
      "Administrative boundaries, P-codes and names: OCHA COD-AB Cameroon (INC / OCHA), CC BY-IGO.",
  },
  "bucrep-rgph2005-repertoire-villages": {
    id: "bucrep-rgph2005-repertoire-villages",
    title:
      "3e RGPH 2005 - Répertoire actualisé des villages du Cameroun (BUCREP)",
    publisher:
      "BUCREP (Bureau Central des Recensements et des Études de Population)",
    license:
      "Government publication, no licence stated. Facts republished with attribution.",
    url: "https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf",
    repositoryUrl: repo("bucrep-rgph2005-repertoire-villages"),
    retrieved: "2025-04-10",
    attribution:
      "Cantons, villages and 2005 population: BUCREP, 3rd General Census of Population and Housing (RGPH 2005), village directory.",
  },
  "elecam-polling-stations-2025": {
    id: "elecam-polling-stations-2025",
    title:
      "ELECAM 2025 electoral roll by polling station (probably the July 2025 provisional roll; download origin not recorded)",
    publisher: "ELECAM (Elections Cameroon)",
    license:
      "Public notice, no licence stated. Facts republished with attribution.",
    // Where ELECAM publishes the official lists (PDFs). The CSV used here
    // was not downloaded from it: its origin was not recorded.
    url: "https://portail.elecam.cm/fr/documentation/",
    repositoryUrl: repo("elecam-polling-stations-2025"),
    // Date of the archived CSV file; the retrieval date is unknown.
    retrieved: "2025-07-24",
    attribution:
      "Polling stations and registered voters: ELECAM (Elections Cameroon), 2025 electoral roll, probably the July 2025 provisional roll.",
  },
  "geoboundaries-cmr-gbopen": {
    id: "geoboundaries-cmr-gbopen",
    title: "geoBoundaries gbOpen CMR (commit 9469f09)",
    publisher: "geoBoundaries, William & Mary geoLab",
    license:
      "CC BY 3.0 (ADM1), CC BY 4.0 (ADM2), ODbL 1.0 (ADM3). No geometry is republished; ADM3 names appear as aliases and as evidence for accented display names.",
    licenseUrl: "https://www.geoboundaries.org/",
    url: "https://github.com/wmgeolab/geoBoundaries/tree/9469f09/releaseData/gbOpen/CMR",
    repositoryUrl: repo("geoboundaries-cmr-gbopen"),
    retrieved: "2026-10-17",
    attribution:
      "Alternative spellings (aliases): geoBoundaries (Runfola et al. 2020), www.geoboundaries.org; ADM3 from OpenStreetMap, ODbL.",
  },
  "location-script-reference-tables": {
    id: "location-script-reference-tables",
    title: "Reference tables (HASC codes, older COD-AB export)",
    publisher: "Statoids (HASC) and OCHA COD-AB, via location-script",
    license: "Facts republished with attribution.",
    url: "https://www.statoids.com/ucm.html",
    repositoryUrl: repo("location-script-reference-tables"),
    retrieved: "2025-07-15",
    attribution: "HASC codes: Statoids (Gwillim Law), www.statoids.com.",
  },
  wikidata: {
    id: "wikidata",
    title: "Wikidata",
    publisher: "Wikimedia Foundation",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    url: "https://www.wikidata.org",
    repositoryUrl: `${REPOSITORY_URL}/tree/main/data/research`,
    retrieved: "2026-10-17",
    attribution: "Wikidata identifiers: Wikidata, CC0.",
  },
  "research-2026-10-17": {
    id: "research-2026-10-17",
    title: "Cameroon locations research notes (decrees, official names)",
    publisher: "cameroon-locations contributors",
    license: "MIT",
    url: `${REPOSITORY_URL}/blob/main/data/research/FINDINGS.md`,
    repositoryUrl: `${REPOSITORY_URL}/tree/main/data/research`,
    retrieved: "2026-10-17",
    attribution:
      "Official spellings and history: cameroon-locations research notes, citing decrees 2007/115, 2008/376 and 2010/198.",
  },
  "cameroon-locations-0.1.0-july-2025": {
    id: "cameroon-locations-0.1.0-july-2025",
    title: "cameroon-locations 0.1.0 (July 2025 export)",
    publisher: "cameroon-locations contributors",
    license: "MIT",
    url: `${REPOSITORY_URL}/tree/main/data/derived/location-script-2025-07`,
    repositoryUrl: `${REPOSITORY_URL}/tree/main/data/derived/location-script-2025-07`,
    retrieved: "2026-10-17",
    attribution: "Historic spellings: cameroon-locations 0.1.0.",
  },
};

/**
 * Every source the published data is derived from, with its licence and the
 * attribution to display. Records reference these by {@link SourceId}.
 */
export const sources: Readonly<Record<SourceId, SourceInfo>> = Object.freeze(
  Object.fromEntries(
    Object.entries(sourceList).map(([id, s]) => [id, Object.freeze(s)]),
  ) as Record<SourceId, SourceInfo>,
);

/**
 * Returns the source records for the given ids, in order, without duplicates.
 * Unknown ids are skipped. The array is frozen.
 */
export function getSources(ids: readonly SourceId[]): readonly SourceInfo[] {
  return Object.freeze(
    [...new Set(ids)].flatMap((id) =>
      Object.hasOwn(sources, id) ? [sources[id]] : [],
    ),
  );
}

/** One-paragraph attribution suitable for a map footer or an "about" page. */
export function attribution(
  ids: readonly SourceId[] = ["ocha-cod-ab-cmr"],
): string {
  return getSources(ids)
    .map((s) => s.attribution)
    .join(" ");
}
