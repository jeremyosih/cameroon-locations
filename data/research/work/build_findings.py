import pathlib,json,collections
R=pathlib.Path(__file__).resolve().parents[1]
load=lambda p:json.loads(p.read_text())
u=lambda n:load(R/'downloads'/n/'SOURCE.json')['url']
link=lambda title,url:f'[{title}]({url})'
D10=link('decree 2010/198, 16 June 2010',u('decree-2010-198'));D07=link('decree 2007/115, 23 April 2007',u('decree-2007-115'));D95=link('decree 95/082, 24 April 1995',u('decree-1995-082'));B=link('BUCREP Répertoire, complete INS copy',u('bucrep-ins-2025'));I=link('CEPED/IREDA copy',u('bucrep-ireda'));M=link('MINFI budget nomenclature, administrative table pp. 27–39',u('minfi-nomenclature-2019'));NW=link('INS North-West yearbook 2024, table 21-1, PDF p. 391 / printed p. 381',u('ins-nw-2024'));EL=link('ELECAM documentation',u('elecam-documentation'))
parts=[f'''# Cameroon administrative-unit research findings

Retrieval date: **2026-10-17**. Research only: no canonical, source or crosswalk input was modified. The decision register is [DECISIONS.md](DECISIONS.md). Evidence excerpts and recommendations are in the JSON files beside this report; raw responses and PDFs, hashes and URLs are under `downloads/`. A decree scan is stronger evidence than a ministry usage table, which is stronger than Wikipedia or a directory. “Not found” reports the result of this search, not proof of nonexistence.

## 1. Akoeman: department and possible transfer

**Finding — keep Nyong-et-So’o. Confidence: high for legal placement; medium-high for the explanation of BUCREP’s conflicting placement.** The signed scan of {D10}, PDF p. 4, places “Arrondissement d’AKOEMAN, chef-lieu : Akoeman” under the Nyong-et-So’o heading. Its territory is that of the former Akoeman district, with Mbalmayo’s territory modified. This is direct administrative evidence, not a boundary-overlap inference. {D95}, PDF p. 3, already places the Akoeman rural commune under Nyong-et-So’o and ties it to the Akoeman district. {M}, p. 30, independently groups code 1190 Akoeman under 119 Nyong et So’o.

BUCREP’s conflicting parent is present in the printed document: Akoeman appears as section 2.9.1 under Nyong-et-Mfoumou, PDF p. 88 / printed p. 87. It is not solely an extraction mistake. The same publication explains in its front matter that its administrative presentation incorporates units created after field collection. [{B}]

**Transfer decree: not found.** The 1995 and 2010 texts support an editorial misclassification more strongly than a move between departments. A temporary intervening transfer cannot be disproved merely from those two dates. **Action:** keep `CM002010001 → CM002010`; retain the BUCREP parent verbatim as a documented source conflict, with an inferred-editorial-error annotation rather than a fictional transfer date. [{D95}; {D10}]

## 2. Kentzou, Bombé, Nguelebok, Ndem-Nam and Kentzou II

**Kentzou → Bombé: confirmed, high confidence.** The decree states “Arrondissement de BOMBE, chef-lieu : Kentzou” (PDF p. 6), with the former Bombé district as its territory and Ndélélé’s limits modified. **Nguelebok → Ndem-Nam: confirmed, high confidence.** It states “Arrondissement de NDEM-NAM, chef-lieu : Nguelebok” (p. 7), with the former Ndem-Nam district as its territory and Batouri’s limits modified. Keep `CM003003002` and `CM003003007` respectively. [{D10}]

BUCREP separately lists **KENTZOU II, 228 residents (104 male, 124 female)** under Ndélélé, PDF p. 125 / printed p. 124. A later communal-forest management plan also lists Kentzou II in its table of Ndélélé’s villages: table 10, “Répartition ethnique de la Commune de Ndélélé.” The latter was accessible through indexed text; its direct PDF request returned 403. These independent listings support treating Kentzou II as a separate village record, not automatically moving it into Bombé. [{B}; [Ndélélé forest management plan 2023](https://www.foretcommunale-cameroun.org/Texteslegaux_doc_cartes_FC_Cameroun/FC_Ndelele/PA_FC_NDELELE_2023.pdf)]

**Exact location and relationship to Kentzou town: not found conclusively.** Jeremy’s local identification would help distinguish a separate settlement, an outlying quarter or a historical naming relationship. **Action:** keep the village under Ndélélé pending location evidence; do not use name resemblance to override its recorded parent. The arrondissement mappings do not depend on resolving this village question. [{D10}; {B}]

## 3. All 39 ELECAM manual decisions

**Result: 39 confirmed as identity/handling decisions; 0 contradicted; 0 not-found. Confidence varies by row.** There are **36 ADM3 mappings, 2 ADM2 spelling mappings, and 1 diaspora exclusion** in the input, so these are not 39 distinct council-to-arrondissement mappings. “Confirmed” does not certify every ELECAM spelling or imply that commune and arrondissement are legally identical types. The complete row evidence and qualifications are in [elecam-crosswalk-verification.json](elecam-crosswalk-verification.json); the source for every decision follows.

| ELECAM name | Canonical target / handling | Verdict | Evidence |
|---|---|---|---|''']
for r in load(R/'elecam-crosswalk-verification.json'):
 target=r['arrondissement'] or 'Diaspora; no domestic P-code'
 ev=r['evidence'][0]
 title='decree 2010/198' if ev['url']==u('decree-2010-198') else 'INS 2024' if ev['url']==u('ins-nw-2024') else 'source'
 parts.append(f"| {r['councilName']} | {target} | {r['verdict']} | {link(title,ev['url'])} |")
parts.append(f'''
The strongest new confirmations include Assamba–Olanguina, Nyakokombo–Kobdombo, Mboanz–Angossas, Dja–Mindourou, Mbotoro–Ouli, Demsa–Gashiga, Fiko–Bonaléa, Nord-Makombe–Ndobiang and West Coast–Idenau. **The signed decree actually prints BEDEND–Atok and DJEMBEM–Demdeng**; these are not silently rewritten as Bebend and Djebem in the evidence. [{D10}, pp. 3–10]

The seven North-West seat pairs are directly supported by a working official statistical publication: Bum–Fonfuka, Mbven–Mbiame, Noni–Nkor, Oku–Elak, Fungom–Zhoa, Menchum Valley–Benakuma and Ngie–Andek. This replaces reliance on the now-broken 2018 yearbook URL. [{NW}]

**Action:** keep all existing identity decisions. Add separate `arrondissementName`, `communeName` and `chefLieu` fields, preserving source spellings. Use the row notes for Fiko/Abo, Bedend/Bebend, Djembem/Djebem, Ndobiang/Ndobian and Gashiga/Gaschiga. [{D10}; {M}]

## 4. Official spellings and numbered units

All **52 input name-variant issues** have an evidence-bearing row in [official-names.json](official-names.json). A ministry table establishes official usage, but does not by itself prove an exclusive statutory orthography. Where sources conflict and no controlling correction was found, `recommendedOfficialName` is null and the recommendation is to keep the current display name pending clarification. The table itself contains forms such as Fum and Jikwa, illustrating why it cannot be imported blindly. [{M}, pp. 35–36; {NW}]

| Case | Recommendation | Confidence and source |
|---|---|---|
| Muyuka / Muyaka | Keep Muyuka | Medium: MINFI p. 38 |
| Santchou / Sanchou | Keep Santchou | Medium: MINFI p. 36 |
| Massangam / Massangan | Keep Massangam | Medium: MINFI p. 37 |
| Malantouen / Malentouen | **Unresolved legal spelling**; keep current; retain both | MINFI p. 37 says Malentouen; [Wikipedia explicitly recognizes both](https://fr.wikipedia.org/wiki/Malentouen) |
| Mvangane / Mvangan | **Unresolved legal spelling**; keep current; retain both | MINFI p. 37 says Mvangane; [commune article](https://fr.wikipedia.org/wiki/Mvangan) uses Mvangan |
| Batchenga / Batschenga | Keep Batchenga | High: signed 2010 decree p. 2; later MINFI p. 28 differs |
| Edzendouan / Ezendouan | Keep Edzendouan | High: signed 2010 decree p. 3 and MINFI p. 29 |
| Makary / Makari | Keep Makary for display; preserve Makari alias | Medium: MINFI p. 32; [commune website uses Makary with a Makari address](https://www.makary.cm/) |
| Massock / Massok-Songloulou | Keep Massock-Songloulou | High: signed 2010 decree p. 8; MINFI p. 34 |
| Upper Bayang / Upper Banyang | **Unresolved exclusive legal form**; preserve both | MINFI p. 38 says Upper-Bayang; [ARMP/Tinto notice](https://armp.cm/details?id_publication=62852&type_publication=AO) says UPPER BANYANG |
| Dikome / Dikomba Balue | Use Dikome-Balue | High: signed 2010 decree p. 11 and MINFI p. 39 |
| Widikum / Widikum-Menka | Prefer fuller Widikum-Menka; retain short and commune forms | Medium: INS 2024 table 21-1; MINFI p. 36 uses short Widikum |
| Abo / Fiko | Keep Fiko for arrondissement; Bonaléa for commune/seat; retain Abo historical alias | 2010 decree p. 8 says Fiko; 1995 commune text says Abo; specific renaming act not found |
| Bebend / Bedend | **Unresolved legal spelling**; keep Bebend pending clarification | 2010 signed scan p. 5 prints BEDEND; MINFI p. 30 prints Bebend |
| Djebem / Djembem | Change display to Djembem; preserve Djebem and Demding aliases | High: signed 2010 decree p. 10 and MINFI p. 36 agree on DJEMBEM / Djembem |

Sources for the page references in the table: {M}; {D10}; {D95}; {NW}. Each JSON row repeats the relevant URL and excerpt, rather than relying on this collective citation.

**Kupe-Manenguba / Kupe-et-Manenguba:** an exclusive legal spelling is **not found**. The recovered third-party transcription of decree 2008/376 uses “Koupe Manengouba”; MINFI uses “Kupe-Muanengouba.” Do not replace a canonical bilingual spelling on that basis alone. These are ADM2 findings, recorded separately in [official-name-conventions.json](official-name-conventions.json). [{link('2008/376 transcription',u('decree-2008-376-copy'))}; {M}, p. 38]

**Numbering:** no universal legal formatting rule was found requiring `Ier`, `1er`, `I`, or English `1st` across all units. The recovered 2007 decree uses `Ngaoundéré 1er` and Roman-numbered later units; MINFI mixes Arabic and Roman forms. **Action:** store base name plus integer ordinal, preserve source labels verbatim, and choose an explicit French/English display convention. This is a data-model recommendation, not a claim that all formats are prescribed by law. [{D07}; {M}, pp. 28–39]

## 5. Creation dates, splits, replacement names and the 360 count

The recovered evidence documents events affecting **106 distinct current P-codes** after November 2005. This is **not 106 net additions**. The complete names, dates, source excerpts, chef-lieux and P-codes are in [arrondissement-history.json](arrondissement-history.json); [arrondissement-history-coverage.json](arrondissement-history-coverage.json) covers all 360 and marks the remaining 254 as not found in the recovered post-2005 acts, rather than assuming pre-2005 creation.

| Date | Instrument | Current units affected | Interpretation |
|---|---|---:|---|
| 2006-09-05 | [2006/272, cited by INS 2011](https://istmat.org/files/uploads/63549/annuaire_statistique_du_cameroun_2011.pdf) | 1: Kye-Ossi | Creation; decree number/date corroborated, original act not recovered |
| 2007-04-23 | {D07} | 51 | 47 creation/reorganization designations plus 4 explicit replacements of previous arrondissement names |
| 2010-06-16 | {D10} | 54 | Existing districts promoted to arrondissements; this is not their settlement or commune founding date |

The four explicit same-territory replacements in the 2007 text are **Manoka → Douala VI**, **Bafoussam → Bafoussam I**, **Baleng → Bafoussam II**, and **Bamougoum → Bafoussam III**. Other sections define villages/quarters and sometimes expressly modify an existing arrondissement, including Bafia, Yaoundé II, Tchéboa, Demsa, Kumbo, Foumban, Bafang, Dschang and Sangmélima. These require historical boundary relationships, not only name aliases. [{D07}, pp. 2, 5–7]

**360-count anchor: 16 June 2010, decree 2010/198, in the framework of decree 2008/376 of 12 November 2008. Confidence: high.** BUCREP’s official *Rapport national sur l’état de la population du Cameroun*, edition 2011, PDF p. 14, explicitly cites both texts before stating “10 régions, 58 départements et 360 arrondissements.” This is stronger support than treating the 2008 framework decree alone as the date all 360 became arrondissements. [{link('BUCREP 2011 report',u('bucrep-360'))}; {D10}]

BUCREP’s village directory presents census population in a later administrative organization, explaining why units created after census fieldwork can have 2005 populations. **Action:** separate `populationReferenceDate` from `boundaryReferenceDate`, and record `creation`, `districtPromotion`, `rename/replacement` and `boundaryChange` events separately. An exhaustive certification that no later changes occurred was **not found**; the 2010 instrument is the recovered post-2008 creation/promotion evidence. [{B}, front matter PDF p. 5; {D10}]

## 6. BUCREP arithmetic anomalies, errata and working downloads

**Two working complete downloads were recovered and saved:** {B} and {I}. Both returned valid 436-page PDFs. Their byte hashes differ, but every corresponding page’s extracted text is identical after whitespace normalization (436/436). The computation and source hashes are recorded in [bucrep-edition-comparison.json](bucrep-edition-comparison.json). Thus these downloads recover access; they do **not** supply a corrected edition. [{B}; {I}]

**Errata or an independent corrected BUCREP/INS table resolving the listed differences: not found. Confidence: high that the recovered copies do not resolve them; limited for the wider negative search.** Searches included errata/rectificatif/corrigé, the publication title, named cantons and selected printed totals. The following differences are those already calculated in the input audit, retained for review against the recovered publication. A negative search is not permission to invent corrected totals. [{B}; {I}]

| Input issue | Printed | Sum of children | Sum minus printed | Evidence |
|---|---:|---:|---:|---|''')
for x in load(R/'bucrep-arithmetic-review.json'):
 parts.append(f"| {x['arr']} / {x.get('canton','arrondissement total')} | {x['printed']:,} | {x['sum']:,} | {x['diff']:+,} | {link('BUCREP',u('bucrep-ins-2025'))} |")
parts.append(f'''
**POUNGO hypothesis:** the 120-person POUNGO row immediately precedes the SOCAPALM heading (PDF p. 391). Moving it between MABI SUD and SOCAPALM would arithmetically cancel the opposite ±120 discrepancies. That is a useful diagnostic hypothesis, **not proof of administrative membership**. Preserve both published values and request village/grouping evidence before changing membership. Kye-Ossi additionally prints 17,120 against male/female values 8,889 and 8,228 (17,117), so a single rebalance would not explain all its inconsistencies. [{B}, PDF pp. 391 and 398]

**Action:** restore download links in provenance when the main agent edits the dataset; keep printed values and separate derived sums; attach unresolved arithmetic flags. [bucrep-arithmetic-review.json](bucrep-arithmetic-review.json) records each large discrepancy. No canonical population was changed. [{B}; {I}]

## 7. ELECAM 2025 station lists, roll snapshots and reuse terms

**Public downloads exist. Confidence: high.** ELECAM’s documentation page lists ten regional polling-station PDFs plus the diaspora PDF for the 12 October 2025 presidential election. All eleven were downloaded; each regional PDF contains station allocations and voter numbers, rather than merely council names. For example, the Adamaoua list has station-level counts and council footers and is dated **30/09/2025**. This is a distinct evidence source from the locally labelled July extract. [{EL}; {link('Adamaoua PDF',u('elecam-pdf-a'))}]

[elecam-2025-published-council-totals.json](elecam-2025-published-council-totals.json) contains **326 unique council footers from nine regions**, with source URL, PDF page, P-code and comparison to local counts where available. North-West’s 34 councils and diaspora are excluded from this extracted table; the full PDFs are retained. The nine-region subtotal is **7,350,565 voters and 29,024 stations**. These are sums of transcribed published footers, **not a national total and not independently recomputed from every station**. The regional sources are listed in [sources.md](sources.md) and in every row. [{EL}]

The Littoral PDF repeats Dibamba and Dibombari: their totals recur on PDF pp. 12/52 and 17/57. They were counted once, with duplicate-page provenance retained. North-West has copied/conflicting headers: p. 2 says BOYO / BELO in French but BUI / BAFUT in English; p. 78 says NGOKE TUNJIA / ELAK. This prevents safe blind council assignment. See [elecam-north-west-review.json](elecam-north-west-review.json). [{link('Littoral PDF',u('elecam-pdf-e'))}; {link('North-West PDF',u('elecam-pdf-g'))}]

For example, Ngaoundal’s September publication gives **29,606 voters / 111 stations**, and Tibati gives **33,023 / 123**. The input dataset instead contains 29,575 / 106 and 32,682 / 119, respectively; those are local input values, not independently authenticated July totals. **Action:** retain both snapshots with their provenance; do not overwrite them under a generic “ELECAM 2025” label. [{link('Adamaoua PDF, pp. 7 and 12',u('elecam-pdf-a'))}]

ELECAM’s July announcement confirms that online roll checking was launched, but does not authenticate the collection date or version of the local extract. A separately downloadable July council-total table, an open station CSV/API, and a document certifying every recovered PDF as the final certified October roll were **not found**. Describe the recovered files as *published 2025 presidential-election polling-station allocations*, with the document’s date where printed. [{link('ELECAM online-file announcement, 10 July 2025','https://portail.elecam.cm/fr/mise-en-ligne-du-fichier-electoral-via-www-elecam-cm/')}; {EL}]

**Licence/terms:** no explicit open-data reuse licence was found on the reviewed documentation/download pages or in the PDFs. Record `licence: not found`; public downloadability is not itself an open licence. The automated browser reported `ERR_CERT_DATE_INVALID` for ELECAM; public downloads were obtained with TLS certificate verification disabled for that host only. This access limitation is recorded rather than presenting them as TLS-verified downloads. [{EL}]

## 8. Wikidata P-code mapping and useful enrichment

[wikidata-pcodes.json](wikidata-pcodes.json) contains all **428 input P-codes**: **10 regions and 58 departments matched**, **349 ADM3 candidates**, and **11 ADM3 not found** in the executed queries. These are research matches, not an assertion that every candidate represents a distinct arrondissement. All matched rows link to their Wikidata entity and retain type, match method, parent-check status and import recommendation. The raw endpoint responses, query text and counts are saved in [wikidata-query-metadata.json](wikidata-query-metadata.json). Source: [Wikidata SPARQL endpoint](https://query.wikidata.org/sparql), queries reproduced alongside this report.

**Entity-type distinction is material:** of the 349 ADM3 candidates, **3** are explicitly typed as [arrondissement of Cameroon, Q106698210](https://www.wikidata.org/wiki/Q106698210), **332** are [commune of Cameroon, Q3076994](https://www.wikidata.org/wiki/Q3076994) items, sometimes also representing towns, and **14** are locality/generic administrative candidates requiring scope review. The three explicitly typed arrondissements are [Bafoussam I](https://www.wikidata.org/wiki/Q106698066), [Bafoussam II](https://www.wikidata.org/wiki/Q106698080), and [Bafoussam III](https://www.wikidata.org/wiki/Q106698052). Filtering only the arrondissement class therefore misses most potentially useful commune records. [Query files: `wikidata-query.sparql`, `wikidata-extra-query.sparql`; endpoint](https://query.wikidata.org/sparql).

**OCHA P-codes are supported by Wikidata:** [P14503 is OCHA Place Code](https://www.wikidata.org/wiki/Property:P14503). The query selecting values beginning `CM` returned **zero bindings**, so no mapping here is an exact OCHA-property match. [P1566](https://www.wikidata.org/wiki/Property:P1566) is GeoNames ID, [P8119](https://www.wikidata.org/wiki/Property:P8119) is HASC, and [P10581](https://www.wikidata.org/wiki/Property:P10581) is Cameroun COG. The inspected matched items returned no HASC values; consequently the delivered matches actually use normalized labels/aliases and parent/type checks, not HASC joins. COG and OCHA codes must not be treated as interchangeable. [Saved property-discovery and P-code queries; endpoint](https://query.wikidata.org/sparql).

The enrichment export contains available values for **414 coordinate-bearing matches, 71 capital-bearing matches, 43 website-bearing matches, 263 GeoNames-bearing matches and 18 matches with population statements explicitly dated in 2005**. These counts cover all matched levels. Coordinates may locate a settlement rather than the administrative centroid; a 2005 date alone does not prove population extent matches the BUCREP unit. Keep reference URLs/stated-in qualifiers and review discrepancies before importing. The source for each candidate is embedded in [wikidata-enrichment.json](wikidata-enrichment.json); properties: [P625](https://www.wikidata.org/wiki/Property:P625), [P36](https://www.wikidata.org/wiki/Property:P36), [P856](https://www.wikidata.org/wiki/Property:P856), [P1082](https://www.wikidata.org/wiki/Property:P1082), [P585](https://www.wikidata.org/wiki/Property:P585).

The **11 not-found ADM3 items** are Ngaoundéré II, Bertoua I and II, Garoua I–III, Ebolowa I and II, and Kumba I–III. A city-wide QID was not substituted for these subdivisions. A false homonym, [Buéa the motor ship](https://www.wikidata.org/wiki/Q1018402), was explicitly excluded; [Buéa the Cameroon locality](https://www.wikidata.org/wiki/Q312209) remains a locality/administrative candidate, not a certified distinct arrondissement item. These negative results concern the executed label/class queries; they do not establish that no suitable Wikidata item exists. [Endpoint and saved query set](https://query.wikidata.org/sparql).

**Action:** import regions/departments only after normal review; stage ADM3 matches as candidates, with entity scope visible. Add commune websites and chef-lieux where references support the same unit. Keep authoritative population and boundary provenance separate. Wikidata structured data is offered under [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing); Wikipedia prose has separate [reuse terms](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use).

### Questions best answered by Jeremy’s local knowledge or project records

- Can you locate **Kentzou II in Ndélélé** precisely, and distinguish it from Kentzou town? The documentary listings support a separate record but do not resolve its exact physical identity. [{B}; [Ndélélé plan](https://www.foretcommunale-cameroun.org/Texteslegaux_doc_cartes_FC_Cameroun/FC_Ndelele/PA_FC_NDELELE_2023.pdf)]
- Does **POUNGO** belong locally to MABI SUD or SOCAPALM, and is there a chiefdom/village register establishing this? The arithmetic alone cannot establish membership. [{B}, PDF p. 391]
- What was the **actual acquisition date and source endpoint/file** for the locally labelled July ELECAM extract? That project provenance cannot be reconstructed from the September publication or July launch announcement alone. [{link('ELECAM announcement','https://portail.elecam.cm/fr/mise-en-ligne-du-fichier-electoral-via-www-elecam-cm/')}; {link('September PDF',u('elecam-pdf-a'))}]
- Do you have **locally held signed acts/corrigenda** for Bebend/Bedend, Malantouen/Malentouen, Mvangan/Mvangane, Upper Bayang/Banyang, or Abo/Fiko? Local pronunciation or common usage would be useful context, but only documentary evidence can settle the legal wording. [{D10}; {M}]

The remaining documentary work—missing original acts, possible errata, certified roll-version status and unresolved Wikidata entities—does not require Jeremy to guess an answer; it remains explicitly open in the artifacts.
''')
(R/'FINDINGS.md').write_text('\n'.join(parts)+'\n')
print('FINDINGS',len((R/'FINDINGS.md').read_text().split()),'words')
