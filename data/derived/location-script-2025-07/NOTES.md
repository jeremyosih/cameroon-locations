# location-script (July 2025): how the library data was built

`snapshot/` is a full copy of `../../../location-script`, taken 2026-10-17. It excludes `node_modules` and one unrelated personal PDF. Its git HEAD is `52c1398`, plus 61 uncommitted files. Checksums are in `SHA256SUMS`. Nothing here was modified.

## Pipeline

1. `loc.pdf` → `loc.txt` (pdf-parse, `pdf-to-text.ts`) → `locv1.txt` → `locv2.txt`: undocumented manual cleanup
2. `clean-file.ts` strips "Page N" → `locv2_cleaned.txt`. That file was then **hand-edited** (about 25 wrapped lines rejoined, Garoua villages re-indented, `AKWA` → `AKWA II`, Mamfe and Dikome renamed).
3. `clean-index.ts` → `cameroon_locations.json`. Each line's level comes from its indentation: ≤12 is an arrondissement total, ≤16 a canton, ≤20 a village.
4. `add-population.ts` (`extracted-pop.txt`) → `_with_population.json`: population for regions and divisions
5. `add-hasc-codes.ts` (`hasc-code.csv`) → `_with_hasc.json`
6. `add-pcode-english.ts` (`pcode-*.csv`) → `cameroon_locations_complete.json`: P-codes, area, English region names. Matching is by name only, using a hard-coded spelling table and a loose substring rule.
7. `add-translation.ts` → `_with_translations.json`: rule-based English (ET→AND…). **Nothing downstream reads this file.**
8. Council names. `create-subdivision-council-mapping.ts` builds the mapping, `test-council-matching.ts` fills it, `fix-failed-matches.ts` adds a guessed override table, then the result was edited by hand. `apply-council-names.ts` applies it and writes `_backup_*`. 15 of the 19 backups are identical. **The final file is `cameroon_locations_complete.json`.**
9. `add-geojson-properties*.ts` → `geoBoundaries-*-enhanced.geojson`: adds P-codes and area to geoBoundaries
10. `add-elecam-data.ts` → `elecam_polling_stations.json` and `elecam_unmatched_councils.json`
11. `export-to-library.ts` → `cameroon-locations/lib/data/*.ts` and `lib/extensions/{geojson,elecam}/data.ts`

No LLM or translation API was used anywhere. The English names are either from OCHA (regions) or produced by rules.

## Defects in the published library (verified 2026-10-17)

| # | Severity | Defect | Where |
|---|---|---|---|
| 1 | Critical | **All 17,035 villages have `cantonCode: 1`** (Ngaoundal), so the village→canton→arrondissement hierarchy is lost | `export-to-library.ts:398` ("use the first canton as a fallback") |
| 2 | Critical | **The published "cantons" are invented**: one per arrondissement, copying its name. The 1,520 real cantons/lamidats/groupements in `complete.json` were never exported. | `export-to-library.ts:263, 357-367` |
| 3 | High | Records lost while parsing: 12 indent-0 villages near Bafoussam (`locv2_cleaned.txt:15155-15166`) and 7 wrapped records (BAMENDA-NKWE, KENELARI, MUNAM, NGWOKWONG, ANDEK, BAFANJI canton and village). Villages total 17,408,664 against the official 17,463,836 (−55,172). 51 cantons don't add up and 19 have no villages. | `clean-index.ts:359-380` |
| 4 | High | Population for regions, divisions and arrondissements is not exported. 21 arrondissements have population −1 (Édéa I/II, Limbe I–III…). | `clean-index.ts:320` |
| 5 | Medium | ADM2 has duplicate P-codes (Sanaga-Maritime, Ndian). The lookup keeps the last copy, a sliver of 10–11 vertices. | geoBoundaries ADM2 |
| 6 | Medium | P-codes were matched by name across the whole country. All 360 came out correct when checked against COD-AB, but AKOEMAN is under a different parent in BUCREP than in OCHA. | `add-pcode-english.ts:224+, :399` |
| 7 | Medium | ELECAM names were replaced by geoBoundaries spellings, and the 37 diaspora councils were dropped | `add-elecam-data.ts:103-112` |
| 8 | Low | `toProperCase` turns spaces into dashes in 377 village names. Village `type` is recomputed from the name. ADM3 `shapeName` is still mojibake. | export |
| 9 | Low | A dormant fallback would set male = female = total ÷ 2 if male/female were missing | `export-to-library.ts:205-226` |

## Information that exists only here (must not be lost)

- `cameroon_locations_complete.json`: the 1,520 real cantons with type and population; the real village → canton links; total, male and female population for regions, divisions and arrondissements; area at every level; the parser's village types
- `cameroon_locations_with_translations.json`: English names for 18 divisions
- `elecam_unmatched_councils.json` and `elecam_polling_stations.json`: ELECAM spellings and the diaspora councils
- `loc.txt`, `locv1.txt`, `locv2.txt`, `locv2_cleaned.txt`: the text at each stage, which is what lets us audit the manual edits
