# Research decision log

Retrieved/reviewed: **2026-10-17**. These are research recommendations only; no canonical/source/crosswalk file has been changed. This log is updated as evidence is checked. See `FINDINGS.md` and the row-level JSON deliverables for the complete evidence.

## D01 — Keep Akoeman in Nyong-et-So’o

**Confidence: high for current parent; medium-high that BUCREP’s placement is an editorial error.** Decree 2010/198 puts “Arrondissement d’AKOEMAN, chef-lieu : Akoeman” under “DEPARTEMENTENT DU NYONG-ET-SO’O” (page 4). It says its territory covers the former Akoeman district and modifies Mbalmayo’s limits. The 1995 commune-creation decree also places Akoeman in Nyong-et-So’o. No transfer from Nyong-et-Mfoumou has been found. Retain the BUCREP source transcription with a conflict note; do not propagate its parent into the canonical hierarchy.

- [Decree 2010/198, 16 June 2010, scan](https://s1084e755aa436055.jimcontent.com/download/version/1592993857/module/10895481257/name/Decret_ErectionDistricts%20en%20Arrond_160610.pdf)
- [Decree 95/082, 24 April 1995, transcription](https://s1084e755aa436055.jimcontent.com/download/version/1583652904/module/12263713557/name/D%C3%A9cret%20no%2095_082%20du%2024%20avril%201995%20portant%20cr%C3%A9ation%20de%20communes%20rurales.pdf)

## D02 — Keep Kentzou → Bombé and Nguelebok → Ndem-Nam

**Confidence: high.** Decree 2010/198 explicitly gives both chef-lieux (pages 6–7). Treat commune, administrative arrondissement and settlement names as separate fields. The village Kentzou II in Ndélélé requires separate identification; it does not disprove the legal pairing.

- [Decree 2010/198](https://s1084e755aa436055.jimcontent.com/download/version/1592993857/module/10895481257/name/Decret_ErectionDistricts%20en%20Arrond_160610.pdf)

## D03 — Restore BUCREP download provenance using the complete document

**Confidence: high (both downloads returned HTTP 200, valid PDFs, 436 pages).** Retain the original local copy and add the recovered complete publication as another version. Its front matter must inform interpretation of the census geography; do not assume its administrative presentation is frozen at November 2005.

- [INS copy, newer 2025/06 path](https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf)
- [CEPED/IREDA copy](https://ireda.ceped.org/inventaire/ressources/cmr-2005-rec_v4.7_repertoire_actualise_villages_cameroun.pdf)

## D04 — Keep arrondissement and commune creation events separate

**Confidence: high.** Decree 2007/115 creates arrondissements; decree 2010/198 elevates 54 existing districts to arrondissements. Commune creation is governed by separate texts. Record the event type, date, predecessor and source rather than one ambiguous “creation date”.

- [Decree 2007/115, 23 April 2007](https://yaounde7.communes-du-cameroun.cm/wp-content/uploads/2023/06/Decret-N%C2%B0-2007_115-du-23-avril-2007-Portant-creation-de-nouveaux-arrondissements-au-sein-de-certains-departements.pdf)
- [Decree 2010/198](https://s1084e755aa436055.jimcontent.com/download/version/1592993857/module/10895481257/name/Decret_ErectionDistricts%20en%20Arrond_160610.pdf)

## D05 — Preserve source spellings and explicit uncertainty

**Confidence: high as a data-model recommendation.** Store legal-source spellings and modern administrative usage separately when they disagree. A chef-lieu name is not automatically an alternative legal name for its arrondissement. Do not automatically “correct” forms found in a signed decree based on a majority vote among secondary sources.

- [2010 decree: Fiko/Bonaléa, Assamba/Olanguina, Dja/Mindourou and other explicit pairings](https://s1084e755aa436055.jimcontent.com/download/version/1592993857/module/10895481257/name/Decret_ErectionDistricts%20en%20Arrond_160610.pdf)
- [MINFI 2019 budget nomenclature, administrative table](https://minfi.gov.cm/wp-content/uploads/2023/06/INTEGRAL_Nomenclature_Budgetaire_de_l_Etat_ULTIMATE.pdf)

## D06 — Separate the local ELECAM extract from publicly published election PDFs

**Confidence: high that public regional downloads are listed; July provenance remains unverified.** ELECAM lists 11 regional/diaspora polling-station documents for the 2025 presidential election. Do not label the local July file a final roll or infer its exact snapshot date from a total alone. All eleven station PDFs have now been downloaded; see D12 for extracted totals and unresolved terms.

- [ELECAM documentation](https://portail.elecam.cm/fr/documentation/)
- [ELECAM announcement of online checking, 10 July 2025](https://portail.elecam.cm/fr/mise-en-ligne-du-fichier-electoral-via-www-elecam-cm/)

## D07 — Wikidata matches must retain entity type and matching evidence

**Confidence: high as a matching rule.** A municipality or town QID must not silently be described as an arrondissement QID. Preserve match method and unresolved cases. Store the SPARQL query and raw response. Match HASC/GeoNames/COG only where an independently established code relationship exists.

- [Wikidata arrondissement class Q106698210](https://www.wikidata.org/wiki/Q106698210)
- [Wikidata commune class Q3076994](https://www.wikidata.org/wiki/Q3076994)
- [HASC property P8119](https://www.wikidata.org/wiki/Property:P8119)
- [Cameroun COG property P10581](https://www.wikidata.org/wiki/Property:P10581)

## D08 — Keep all 39 manual identity decisions; separate their types

**Confidence: high for decree-backed pairs, medium for the remaining documented correspondences.** The verification file covers the 36 ADM3 mappings, two ADM2 spelling mappings and one diaspora exclusion in the input. None was contradicted by the recovered evidence. Confirmation of identity does not certify a source spelling. The seven North-West seat pairs now use a downloaded official 2024 yearbook, replacing the broken 2018 URL.

- [INS North-West yearbook 2024, table 21-1, PDF p. 391](https://ins-cameroun.cm/wp-content/uploads/2025/09/Annuaire-statistique-du-Nord-Ouest-ed-2024.pdf)
- [All row-level decisions and evidence](elecam-crosswalk-verification.json)

## D09 — Prefer Djembem; leave four legal spelling questions open

**Confidence: high for Djembem; unresolved for Bedend/Bebend, Malantouen/Malentouen, Mvangane/Mvangan and Upper Bayang/Banyang.** Recommend Djembem because both the signed 2010 decree and MINFI table support it. Recommend the documented forms Dikome-Balue and Ndem-Nam, and the fuller INS form Widikum-Menka; preserve all source aliases. The four unresolved entries have a null `recommendedOfficialName` and retain their current display name pending documentary clarification. No naming changes have been applied to the canonical dataset.

- [2010 decree, pp. 5, 7, 10–11](https://s1084e755aa436055.jimcontent.com/download/version/1592993857/module/10895481257/name/Decret_ErectionDistricts%20en%20Arrond_160610.pdf)
- [MINFI administrative table](https://minfi.gov.cm/wp-content/uploads/2023/06/INTEGRAL_Nomenclature_Budgetaire_de_l_Etat_ULTIMATE.pdf)
- [INS fuller Widikum-Menka usage](https://ins-cameroun.cm/wp-content/uploads/2025/09/Annuaire-statistique-du-Nord-Ouest-ed-2024.pdf)
- [ARMP/Tinto Upper Banyang usage](https://armp.cm/details?id_publication=62852&type_publication=AO)
- [52 row-level name decisions](official-names.json)

## D10 — Anchor the 360 count to 16 June 2010; do not count every designation as an addition

**Confidence: high, with medium confidence for Kye-Ossi’s unrecovered original act.** The history export documents 106 current units: 51 named in 2007/115, 54 district promotions in 2010/198 and Kye-Ossi in 2006/272. Four of the 2007 entries explicitly replace former arrondissement names on the same territories. The official BUCREP 2011 report cites the 2008 framework and 2010 promotion decree for the count of 360. Units without a recovered post-2005 event remain “not found,” not assumed to predate the census.

- [BUCREP 2011 report, PDF p. 14](https://bucrep.org/download/25463/?tmstv=1779164838)
- [2007 decree](https://yaounde7.communes-du-cameroun.cm/wp-content/uploads/2023/06/Decret-N%C2%B0-2007_115-du-23-avril-2007-Portant-creation-de-nouveaux-arrondissements-au-sein-de-certains-departements.pdf)
- [INS 2011 legal-text inventory: Kye-Ossi; indexed text, direct download timed out](https://istmat.org/files/uploads/63549/annuaire_statistique_du_cameroun_2011.pdf)
- [106 event records](arrondissement-history.json)

## D11 — Do not rebalance BUCREP totals or move POUNGO on arithmetic alone

**Confidence: high for identical recovered page text; no corrected values established.** The two complete PDFs have different hashes but identical normalized extracted text on all 436 pages. Neither is an errata edition. POUNGO’s 120 residents explain the opposite MABI SUD/SOCAPALM differences arithmetically if reassigned, but membership evidence is still required. Retain printed figures and computed discrepancies separately.

- [INS complete directory, PDF p. 391 for POUNGO](https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf)
- [IREDA complete directory](https://ireda.ceped.org/inventaire/ressources/cmr-2005-rec_v4.7_repertoire_actualise_villages_cameroun.pdf)
- [Arithmetic review](bucrep-arithmetic-review.json)

## D12 — Stage 326 unique ELECAM council footers; exclude unreviewed North-West assignments

**Confidence: high for transcribed footer values; final-roll certification not found.** The nine-region extraction contains 326 unique council totals. Dibamba and Dibombari are each printed twice in the Littoral PDF and are counted only once. North-West’s conflicting bilingual/council headings require review before assignment. Do not call the subtotal a national count or label the local July extract and September publication as the same snapshot. All eleven actual regional/diaspora PDFs are saved. No open reuse licence was found in the reviewed material.

- [ELECAM download catalogue](https://portail.elecam.cm/fr/documentation/)
- [Littoral PDF, duplicate totals on pp. 12/52 and 17/57](https://portail.elecam.cm/download/e-liste-bv-littoral-presidentielle-2025/?wpdmdl=3199)
- [North-West PDF, conflicting headers](https://portail.elecam.cm/download/g-list-of-ps-north-west-2025-presidential-election/?wpdmdl=3201)
- [326 council footer records](elecam-2025-published-council-totals.json)

## D13 — Treat ADM3 Wikidata links as typed candidates, and record the actual code coverage

**Confidence: high for returned query data; medium/low for many ADM3 entity-scope matches.** The final table covers all 428 P-codes: 417 populated QIDs and 11 not found. ADM3 comprises three explicitly typed arrondissement items, 332 commune items and 14 locality/generic administrative candidates. Do not automatically assert `sameAs` between an arrondissement and a town/commune item. All 68 ADM1/ADM2 matches use labels and type/parent evidence. No HASC values were returned for the matched items.

**Correction to the initial search hypothesis:** Wikidata does have an OCHA Place Code property, P14503. The Cameroon-prefix query returned zero bindings, so no delivered match uses it. Store query text and raw results to make this finding reproducible. Reject the unrelated Buéa motor-ship homonym. Do not fill missing numbered subdivisions with the parent city QID.

- [OCHA Place Code property P14503](https://www.wikidata.org/wiki/Property:P14503)
- [HASC P8119](https://www.wikidata.org/wiki/Property:P8119)
- [Unrelated Buéa motor ship Q1018402](https://www.wikidata.org/wiki/Q1018402)
- [Mapping](wikidata-pcodes.json), [queries and statistics](wikidata-query-metadata.json), [candidate enrichment](wikidata-enrichment.json)

## D14 — Keep Kentzou II as a distinct unresolved village identity

**Confidence: medium-high for its recorded Ndélélé parent; exact location not found.** BUCREP and the later Ndélélé forest-management plan both list Kentzou II under Ndélélé. This supports preserving the village record independently of Kentzou, the chef-lieu of Bombé. Jeremy’s local identification can resolve its physical location and naming relationship; it does not need to reopen the decree-backed Bombé mapping.

- [BUCREP, PDF p. 125](https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf)
- [Ndélélé forest-management plan 2023, table 10; indexed text, direct request 403](https://www.foretcommunale-cameroun.org/Texteslegaux_doc_cartes_FC_Cameroun/FC_Ndelele/PA_FC_NDELELE_2023.pdf)
