# Reference tables of unrecorded origin (from location-script)

| Field | Value |
|---|---|
| Source id | `location-script-reference-tables` |
| Retrieved | 2025-07-15 by Jeremy Osih. **No URLs recorded.** |

| File | Most likely origin | Evidence | Confidence |
|---|---|---|---|
| `pcode-region.csv`, `pcode-division.csv`, `pcode-subdivision.csv` | An export of the OCHA COD-AB attribute tables (an older release than the 2026 one in `ocha-cod-ab-cmr`) | Column names `ADM1_PCODE`, `ADM2_REF` and `AREA_SQKM` are COD conventions. All 360 codes match COD-AB 2026 exactly. | High. Use `ocha-cod-ab-cmr` as the authority. |
| `hasc-code.csv` | Statoids (http://www.statoids.com/ucm.html), which keeps HASC codes for Cameroon's departments | Statoids-style codes (`CM.AD.DJ`). Only goes down to division level. | Medium |
| `extracted-pop.txt` | Text of `bucrep-rgph2005-repertoire-villages/raw/pop-region-division.pdf` | Identical text | High |

These are kept so nothing is lost. Prefer the primary sources wherever they overlap.
