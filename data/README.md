# Cameroon locations: data pool

This is the raw material for the `cameroon-locations` package. Rules:
- **Never delete or overwrite** anything under `sources/*/raw` or `derived/*/snapshot`.
- Every source has a `SOURCE.md` (origin, licence, retrieval date, known limits) and a `SHA256SUMS`.
- Anything published must be traceable to these files.

## Sources

| Id | What | Levels | Licence | Trust |
|---|---|---|---|---|
| [`ocha-cod-ab-cmr`](sources/ocha-cod-ab-cmr/SOURCE.md) | Official boundaries and gazetteer (INC / OCHA), v01, reviewed 2025-10-30 | ADM0–3 geometry, P-codes, EN/FR names, area, centroids, capitals | CC BY-IGO | **Authoritative** for codes, ADM1–3 names and geometry |
| [`bucrep-rgph2005-repertoire-villages`](sources/bucrep-rgph2005-repertoire-villages/SOURCE.md) | 2005 census village directory (PDF) | ADM1–3, about 1,520 cantons, about 17k villages, population by sex | Unstated (government publication) | **Authoritative** for villages, cantons and 2005 population. The official link is dead, so the local copy is precious. |
| [`geoboundaries-cmr-gbopen`](sources/geoboundaries-cmr-gbopen/SOURCE.md) | geoBoundaries `9469f09` | ADM1–3 geometry | CC BY 3.0 / CC BY 4.0 / **ODbL** (ADM3) | Secondary. Use COD-AB instead. Kept for cross-checking. |
| [`elecam-polling-stations-2025`](sources/elecam-polling-stations-2025/SOURCE.md) | Electoral roll by polling station, probably the July 2025 provisional roll | Communes, about 17.6k centres, about 30k stations, voters | Unknown | Good, but the provenance URL is missing |
| [`location-script-reference-tables`](sources/location-script-reference-tables/SOURCE.md) | P-code, HASC and population CSVs of unrecorded origin | ADM1–3 | — | Superseded by COD-AB and BUCREP. Kept. |

## Research

[`research/`](research/FINDINGS.md) holds the web research run of 2026-10-17 (GPT-6-Astra). Every claim has a URL and quote. It includes:
- decrees 2007/115, 2008/376 and 2010/198, and the 1998 gazette
- the complete BUCREP edition (INS and IREDA)
- the 11 ELECAM 2025 PDFs
- Wikidata mappings and arrondissement history

`DECISIONS.md` lists the recommendations. The build folds in the Wikidata IDs, history, chef-lieux and official-name evidence, each tagged with source `research-2026-10-17`.

## Derived

- [`derived/location-script-2025-07`](derived/location-script-2025-07/NOTES.md): full snapshot of the July 2025 extraction pipeline, with a lineage write-up and a defect list for the published library.

## Canonical dataset

[`canonical/`](canonical/README.md) is the merged, source-attributed dataset keyed by OCHA P-code: 10 / 58 / 360 / 1,504 cantons / 17,070 villages / 30,353 polling stations. Rebuild it with `./tools/build-all.sh`. Manual decisions live in `patches/` and `crosswalks/`, each with a reason.

## Tools

- `tools/xref-codab.ts`: compares COD-AB P-codes and names with the library and with geoBoundaries
- `tools/inspect_xlsx.py`: lists the sheets and columns of an XLSX (`uv run --with openpyxl python -I tools/inspect_xlsx.py <file>`)

## Cross-reference status (2026-10-17)

- P-codes are identical across COD-AB, the library and geoBoundaries-enhanced: 10/10, 58/58 and 360/360.
- ADM3 names differ in 58 places, mostly numbering style (I/1er/1st). About 15 are spelling variants, some of them library typos. Plan: keep every variant as an alias.
