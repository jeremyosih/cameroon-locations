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

*Applied in:* nothing changes. The open question in `issues.json` is closed by this decision.

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

*Applied in:* `crosswalks/bucrep-codab.json`. The issue is marked resolved in `issues.json`.

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
