# OCHA COD-AB Cameroon: Subnational Administrative Boundaries

| Field | Value |
|---|---|
| Source id | `ocha-cod-ab-cmr` |
| Publisher | OCHA Field Information Services Section (FISS) / HDX, contributed by OCHA Cameroon |
| Original producer | Institut National de Cartographie (INC), Cameroon |
| Consolidation | OCHA with the IMWG in Yaoundé; REACH with the IMWG in the SW region; files verified by ITOS |
| Landing page | https://data.humdata.org/dataset/cod-ab-cmr |
| API (metadata) | https://data.humdata.org/api/3/action/package_show?id=cod-ab-cmr |
| Licence | CC BY-IGO (Creative Commons Attribution for Intergovernmental Organisations). Attribution required. |
| Dataset version | v01 |
| Valid on | 2019-01-04 (`valid_on` field on every feature) |
| Boundaries created | 1987-08-22, per HDX notes (geometry is old; names and codes have been reviewed since) |
| Last review | 2025-10-30, "reviewed for accuracy and completeness" |
| Resource files last modified | 2026-01-26 |
| HDX package last modified | 2026-08-14 |
| Retrieved | 2026-10-17 via the HDX CKAN API (curl), by Claude Code for Jeremy Osih |

## Contents

- `raw/`: untouched downloads. Checksums are in `raw/SHA256SUMS`.
  - `cmr_admin_boundaries.geojson.zip`, `.shp.zip`, `.gdb.zip`: the same boundaries in three formats
  - `cmr_admin_boundaries.xlsx`: the gazetteer (attribute tables only)
  - `hdx-package-metadata.json`, `hdx-activity.json`: the HDX metadata and change log at retrieval time
- `extracted/geojson/`: an unzip of the GeoJSON archive, otherwise unmodified

Layers: admin0 (country), admin1 (10 régions), admin2 (58 départements), admin3 (360 arrondissements), admincapitals (58), adminpoints (429), and adminlines. `*_em` files are the "edge-matched" variants, with shared borders snapped to neighbouring countries, and use French as the primary name.

Key attributes: `admN_pcode`, `admN_name` (EN), `admN_name1` (FR), `admN_ref_name1` (ASCII reference name), `area_sqkm`, `center_lat`, `center_lon`, `valid_on`, `version`.

## Cross-reference results (2026-10-17, `tools/xref-codab.ts`)

- **P-codes**: these match the `cameroon-locations` library exactly at every level: 10/10, 58/58 and 360/360, with no extras on either side. The geoBoundaries-enhanced files in `location-script` also carry exactly these P-codes.
- **Names**: there is 1 ADM2 difference (lib "Kupe-et-Manenguba" vs "Kupe-Manenguba"). There are 58 ADM3 differences, most of them numbering style ("Yaoundé I" vs "Yaoundé 1er", "Bamenda-1" vs "Bamenda 1st"). About 15 are spelling variants. Some look like library typos (Muyaka→Muyuka, Sanchou→Santchou, Massangan→Massangam, Malentouen→Malantouen); others are legitimate variants (Batschenga/Batchenga, Abo-Fiko/Fiko, Widikum-Menka/Widikum, Upper-Banyang/Upper Bayang). Keep every variant as an alias. Don't overwrite any of them.
- **Caveats**:
  - `cmr_admincapitals` uses an older, shorter P-code scheme (`CM0302`, not `CM003002`), so it needs a crosswalk.
  - HDX says the gazetteer references OSM IDs and old "COG" codes at ADM3. Neither appears in the XLSX columns.
