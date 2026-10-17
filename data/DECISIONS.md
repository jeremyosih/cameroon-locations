# Data decisions

These are judgement calls, as opposed to facts read from a source. Each one says what was decided, why, and where it's applied. The research run's own recommendations are in `research/DECISIONS.md`.

## D1: Primary names come from OCHA COD-AB (2026-10-17, Jeremy)

`name.fr` / `name.en` use the OCHA COD-AB names exactly as published.
- **Regions** are bilingual (Adamawa/Adamaoua, Far-North/Extrême-Nord…).
- **Divisions and arrondissements** have a single official name: French in francophone regions ("Yaounde 1er", "Ngaoundere 2e") and English in the North-West and South-West ("Bamenda 1st", "Limbe 2nd").
- **Accents are dropped by OCHA at ADM3**, e.g. "Yaounde" for "Yaoundé".

Every other spelling is kept in `aliases` with its source: BUCREP, ELECAM, decrees, the Finance Ministry list and OSM. The research recommendations are in `officialName`.

*Applied in:* `tools/build-canonical.ts` (COD-AB backbone).

## D2: Kentzou II is a village in Ndélélé, distinct from Kentzou (Bombé) (2026-10-17, educated guess)

- **Kentzou** is the chef-lieu of Bombé (decree 2010/198).
- **Kentzou II** is listed under Ndélélé, both by BUCREP 2005 and by the 2023 Ndélélé forest-management plan.

Two sources agree on Ndélélé, and the "II" suffix is the usual way of naming a separate settlement. So these are treated as two places with similar names. That's common in Cameroon, where 2,000+ villages share a name with another. Neither record is moved.

*Applied in:* no record changes. The open question in `issues.json` is marked resolved by `decisions/issue-resolutions.json` (D10).

## D3: POUNGO belongs to canton SOCAPALM, not MABI SUD (2026-10-17, educated guess)

The PDF (p. 390) prints POUNGO as the last row under MABI SUD, slightly out of line with the village column. MABI SUD's printed total is **exactly 120** below the sum of its villages if POUNGO is included, and SOCAPALM's printed total is **exactly 120** above the sum of its own villages. POUNGO has 120 residents.

The totals were computed by machine from the census records, whereas the row placement is typesetting. So the totals are the better evidence. The record keeps `source.decision.printedUnderCanton = "MABI SUD"`, so the printed form isn't lost.

*Applied in:* `decisions/bucrep-moves.json`, which `tools/parse-bucrep.ts` applies. Both canton mismatches disappear.

## D4: The ELECAM CSV and the ELECAM PDFs are different snapshots of the same roll (2026-10-17, Jeremy)

| Version | Date | Voters | Stations |
|---|---|---|---|
| Local CSV | file dated 2025-07-24, close to the July 2025 provisional roll | 7,845,575 | 30,353 |
| Published PDFs | September 2025 | about 8.0M | — |
| Final roll (press) | October 2025 | 8,010,464 | 31,653 + 108 |

The differences are expected between snapshots, so the two versions are not reconciled against each other. Both are kept as separate sources. The canonical `elecam2025` field comes from the CSV, which is the July snapshot.

*Applied in:* `sources/elecam-polling-stations-2025/SOURCE.md` and `research/elecam-2025-published-council-totals.json`.

## D5: Akoeman is in Nyong-et-So'o (2026-10-17, verified)

Decree 2010/198, p. 4 (checked visually): "DÉPARTEMENT DU NYONG-ET-SO'O – Arrondissement d'AKOEMAN, chef-lieu : Akoeman". The BUCREP directory placing it under Nyong-et-Mfoumou is an error in the directory. Its villages are kept under CM002010001.

*Applied in:* `crosswalks/bucrep-codab.json`. The parent conflict in `issues.json` is marked resolved by `decisions/issue-resolutions.json` (D10).

## D6: The data pool lives in the cameroon-locations repo, with large files in Git LFS (2026-10-17, Jeremy)

Sources stay next to the code. The npm package never includes `data/` (enforced by `files` in package.json).

## D7: Publish every source in the package, with attribution (2026-10-17, Jeremy)

All sources, including BUCREP (cantons, villages, population) and ELECAM (polling stations), are published in the npm package and the shadcn registry. The PDFs themselves are not redistributed. Every published dataset carries its provenance:

- each record has a `sources` list of source ids;
- the package exports `sources` and `attribution()` with, for each source, its licence, its online URL and the URL of its archived copy under `data/sources/<id>`;
- every GeoJSON file has a top-level `metadata` member with the same information;
- `NOTICE.md` at the repository root is shipped in the package.

*Applied in:* `packages/cameroon-locations/src/sources.ts`, `NOTICE.md`, `data/sources/*/SOURCE.md`.

## D8: Display names are bilingual, with Roman numerals (2026-10-17, Jeremy)

`name.fr` and `name.en` in the package use one bilingual convention for numbered arrondissements: Roman numerals, as in "Yaoundé I", "Bamenda II". Neither the French ordinal ("Yaoundé 1er") nor the English one ("Bamenda 1st") is used for display. The ordinal is also stored as an integer (`ordinal`). Accents are restored where an official or established spelling has them ("Yaoundé", "Ngaoundéré"), with evidence from `research/official-names.json` or the decrees. OCHA's ASCII forms stay in `refName` and in `aliases`, like every other spelling. Regions keep their distinct French and English names (Extrême-Nord / Far North).

*Applied in:* `packages/cameroon-locations/scripts/generate.ts`.

## D9: The 7 BUCREP level disagreements are cantons, as the text indentation says (2026-10-17, verified)

The text parse (indentation) and the PDF typography (bold, x position) disagree on 7 rows. Each was checked on the rendered page and against the printed totals. In all 7, the row's printed total equals the sum of the rows below it, and the arrondissement total equals the sum of its cantons only if the row is counted as a canton.

| Row | Page | Typography | Totals |
|---|---|---|---|
| BANDEM RIVE GAUCHE (Nkondjock) | 228 | canton indent, regular weight, no shading | 3,581 = Σ 11 villages; 17,428 = 4,232 + 3,581 + 9,615 |
| MBESA (Belo) | 298 | bold and shaded, set slightly left (x 102.7 vs 107.3) | 5,621 = Σ 1 village; 40,757 = 10,130 + 25,006 + 5,621 |
| JAKIRI TOWN (Jakiri) | 300 | shaded, regular weight | 9,959 = Σ 10 villages; 47,022 = 9,959 + 495 + 36,568 |
| NKUM (Nkum) | 302 | shaded, regular weight | 44,059 = Σ 26 villages = arrondissement total |
| NGIE TOWN (Ngie) | 319 | shaded, regular weight | 1,983 = Σ 2 villages; 17,697 = 1,983 + 15,714 |
| NGIE (Ngie) | 319 | shaded, regular weight | 15,714 = Σ 19 villages |
| FOMOPEA (Fokoué) | 343 | canton indent, regular weight, no shading | 1,193 = Σ 1 village; 9,576 = Σ 6 cantons |

The totals were computed from the census records, whereas weight and shading are typesetting. So the text level stands: no patch is added and the canonical records don't change. The irregular typography is a printing inconsistency, so it is kept as printed and listed in `issues.json` as `printed-typography-inconsistency`.

*Applied in:* `patches/known-extraction-differences.json` (each entry has `status: "confirmed"` and its evidence). `tools/compare-extractions.ts` now also fails when a listed difference no longer occurs.

## D10: Issues closed by a decision are counted apart from open ones (2026-10-17, verified)

`summary.json` counted issues by kind regardless of status, so it still showed 1 `open-question` (closed by D2) and 1 `parent-conflict` (closed by D5). The status of a closed issue now comes from `decisions/issue-resolutions.json`, which names the decision, the resolution and the evidence; the build fails if an entry matches no issue. `summary.issues` counts open issues and `summary.resolvedIssues` counts closed ones. D3 needs no entry, because its move removes the two canton mismatches altogether.

*Applied in:* `decisions/issue-resolutions.json`, `tools/build-canonical.ts`.
