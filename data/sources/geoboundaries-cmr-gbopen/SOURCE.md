# geoBoundaries gbOpen: Cameroon ADM1–ADM3

| Field | Value |
|---|---|
| Source id | `geoboundaries-cmr-gbopen` |
| Publisher | geoBoundaries (William & Mary geoLab), https://www.geoboundaries.org |
| Release | Git commit `9469f09` of wmgeolab/geoBoundaries. The API metadata in `raw/geoboundaries-api-ADM*.json` shows a source update of 2023-01-19. |
| Upstream sources | ADM1: "geoBoundaries, Wikimedia" (year 2016) · ADM2: "Open Africa" (2016) · ADM3: "OpenStreetMap, Wambacher" (2017) |
| **Licences** | ADM1: CC BY 3.0 · ADM2: CC BY 4.0 · **ADM3: ODbL 1.0, which is share-alike.** A database derived from ADM3 has to stay under ODbL. That matters for an npm package; prefer `ocha-cod-ab-cmr` geometry for redistribution. |
| Retrieved | Originally by Jeremy Osih on about 2025-07-15, no URL recorded. Pristine copies were re-downloaded on 2026-10-17 from `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CMR/ADM1/` (and `ADM2/`, `ADM3/`). |

## Files (`raw/`)

- `pristine-9469f09/`: untouched upstream files.
- `as-used-in-location-script/`: the copies `location-script` used. ADM1 and ADM2 are byte-identical to the originals. **ADM3 has 8 hand-made name fixes**, all of which look correct:

| shapeID | upstream | edited to |
|---|---|---|
| 9386221B30051434650044 | BarÃ© | Baré-Bakem |
| 9386221B64770974028815 | Mouloundou | Moloundou |
| 9386221B19712168109098 | Tabati | Tibati |
| 9386221B15912043956147 | Mudemba | Mundemba |
| 9386221B26371273513281 | Okala | Okola |
| 9386221B18747608346686 | Nkol-MÃ©tet | Nkolmetet |
| 9386221B63165166777879 | Nijkwa | Njikwa |
| 9386221B7054821525392 | Gachiga | Gaschiga |

## Known limits

- There are no P-codes upstream. `location-script` attached OCHA P-codes by matching names. All of them match COD-AB (see `ocha-cod-ab-cmr/SOURCE.md`).
- Upstream names have UTF-8 double-encoding damage (about 90 `Ã` sequences in ADM3).
- ADM2 has 60 features for 58 divisions: Sanaga-Maritime and Ndian each have an extra sliver polygon.
- The geometry is not the official INC geometry. ADM3 is OSM-derived.
