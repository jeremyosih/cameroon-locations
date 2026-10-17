# ELECAM polling stations (2025 electoral roll, probably provisional)

| Field | Value |
|---|---|
| Source id | `elecam-polling-stations-2025` |
| Producer | ELECAM (Elections Cameroon), https://www.elecam.cm |
| Retrieved | File dated 2025-07-24, obtained by Jeremy Osih. **The download URL and method were not recorded.** ELECAM has no known open-data CSV; it published the provisional roll online in July 2025, organised by commune and polling station. |
| Licence | No licence stated. Voter counts by station are public notices. **Published in the package with attribution** (owner decision D7, 2026-10-17). |
| Online | https://portail.elecam.cm/fr/documentation/ (regional PDFs of the 2025 lists) |
| Columns | `REGION_NAME, DIVISION_NAME, COUNCIL_NAME, CENTER_NAME, STATION_NAME, TOTAL` (TOTAL is registered voters) |

## Contents (from `location-script` analysis)

- 30,353 polling stations, 17,578 unique polling centres, 397 councils (360 domestic and 37 diaspora), 7,845,575 voters, of whom 26,758 are abroad.
- For comparison, the **final** 2025 presidential roll (12 October 2025) had 8,010,464 voters, 31,653 domestic stations and 108 abroad, according to Cameroon Tribune and AllAfrica (Oct 2025). The lower counts here match the **July 2025 provisional roll**. That match is inferred, not confirmed.

## Known limits

- Names are in ELECAM upper case. `location-script` replaced them with geoBoundaries spellings and dropped the 37 diaspora councils. The originals are only kept here.
- The councils are communes, which match arrondissements 1:1 inside Cameroon.

## Official publications (found 2026-10-17)

ELECAM publishes the 2025 presidential polling-station lists as regional PDFs (11 documents, diaspora included) at https://portail.elecam.cm/fr/documentation/. All 11 are saved in `research/downloads/elecam-pdf-*`. The research run extracted 326 council footer totals (`research/elecam-2025-published-council-totals.json`). North-West headers still need review. No open reuse licence was found. The local CSV's own origin and snapshot date are still unknown, so it should not be labelled as the published list.
