# BUCREP 3rd RGPH 2005: Répertoire actualisé des villages du Cameroun

| Field | Value |
|---|---|
| Source id | `bucrep-rgph2005-repertoire-villages` |
| Producer | BUCREP (Bureau Central des Recensements et des Études de Population), Cameroon |
| Citation | *Troisième Recensement Général de la Population et de l'Habitat du Cameroun*, Volume IV – Tome 07, "Répertoire actualisé des villages du Cameroun", BUCREP |
| Census reference date | November 2005. The national total is 17,463,836 inhabitants. |
| Official URL | https://ins-cameroun.cm/wp-content/uploads/2023/06/Repertoire_actualise_villages_cameroun1-3.pdf. This URL returns HTTP 404. **Working copies (found 2026-10-17):** https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf (INS) and https://ireda.ceped.org/inventaire/ressources/cmr-2005-rec_v4.7_repertoire_actualise_villages_cameroun.pdf (CEPED/IREDA). Both are the complete 436-page edition, stored in `research/downloads/bucrep-ins-2025` and `bucrep-ireda`. |
| Related | Results report (host no longer resolves as of 2026-10-17): https://files.aho.afro.who.int/afahobckpcontainer/production/files/3e_RGPH_Rapport_de_présentation_des_résultats_2005.pdf · IHSN catalogue: https://datacatalog.ihsn.org/catalog/4237 |
| Licence | Not stated (official government statistical publication). **The extracted facts (names, hierarchy, counts) are published in the package with attribution** (owner decision D7, 2026-10-17). The PDF itself is not redistributed in the package. |
| Online | https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf (INS) and https://ireda.ceped.org/inventaire/ressources/cmr-2005-rec_v4.7_repertoire_actualise_villages_cameroun.pdf (CEPED/IREDA) |
| Retrieved | Before 2025-04-10 by Jeremy Osih. macOS records the download as coming from https://smallpdf.com/. |

## Files (`raw/`)

- `loc.pdf`: 416 pages. The body starts at document page 10 ("1. RÉGION DE L'ADAMAOUA"), so the cover and front matter were probably trimmed with smallpdf. Hierarchy: Région → Département → Arrondissement → Canton / Lamidat / Groupement → Quartier / Village, with total, male and female population for each line.
- `pop-region-division.pdf`: pages 7–8 of the same document (population by region and division), cut with iLovePDF on 2025-07-15.

## What it is good for

This is the only source in the pool with **villages/quartiers (about 17k)**, **cantons/chefferies (about 1,520)** and **population**. Its arrondissement names are the 2005 BUCREP spellings, and its P-codes come from matching names to OCHA (see `derived/location-script-2025-07/NOTES.md`).

## Known limits

- The data is from 2005, so population is 20 years old. Village names are BUCREP transcriptions in upper case.
- Text extraction (pdf-parse) loses layout. The level of each line was inferred from its indentation, and the text was edited by hand before parsing. Some records were dropped or misplaced; see NOTES.md.
- AKOEMAN is under Nyong-et-Mfoumou here but under Nyong-et-So'o in OCHA and ELECAM.

## Edition check (2026-10-17)

`loc.pdf` (416 pages) matches pages 11–436 of the official INS edition word for word, checked with `tools/pdf_text_compare.py`. It is the official document without its front matter. The INS and IREDA copies have different hashes but identical text, and neither is an errata edition.

**Known directory error:** Akoeman is listed under Nyong-et-Mfoumou. Decree 2010/198, p. 4 places the arrondissement (ex-District d'Akoeman) in Nyong-et-So'o.
