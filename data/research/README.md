# Cameroon administrative research

Reviewed **2026-10-17**. Start with [FINDINGS.md](FINDINGS.md) for answers to all eight questions and [DECISIONS.md](DECISIONS.md) for the linked decision register. No input dataset files were modified; no commit or push was made.

| File | Purpose |
|---|---|
| [FINDINGS.md](FINDINGS.md) | Evidence, confidence, recommended actions and open questions |
| [DECISIONS.md](DECISIONS.md) | Key decisions, reasons and source links |
| [elecam-crosswalk-verification.json](elecam-crosswalk-verification.json) | All 39 manual decisions, including the two ADM2 cases and diaspora exclusion |
| [official-names.json](official-names.json) | All 52 ADM3 spelling issues; null recommendations mean unresolved legal wording |
| [official-name-conventions.json](official-name-conventions.json) | Kupe-Manenguba and numbered-unit conventions |
| [arrondissement-history.json](arrondissement-history.json) | 106 documented post-2005 events; these are not 106 net additions |
| [arrondissement-history-coverage.json](arrondissement-history-coverage.json) | Coverage of all 360 current arrondissements |
| [bucrep-arithmetic-review.json](bucrep-arithmetic-review.json) | Large discrepancies and non-correction decisions |
| [bucrep-edition-comparison.json](bucrep-edition-comparison.json) | Complete-PDF comparison and hashes |
| [elecam-2025-published-council-totals.json](elecam-2025-published-council-totals.json) | 326 unique published council footers from nine regions; excludes North-West and diaspora |
| [elecam-north-west-review.json](elecam-north-west-review.json) | Conflicting published headers requiring review |
| [wikidata-pcodes.json](wikidata-pcodes.json) | All 428 P-codes; typed QID candidates and explicit not-found rows |
| [wikidata-enrichment.json](wikidata-enrichment.json) | Candidate coordinates, seats, websites, identifiers and dated population statements |
| [wikidata-query-metadata.json](wikidata-query-metadata.json) | SPARQL text, counts, coverage and limitations |
| [sources.md](sources.md) / [sources.json](sources.json) | URLs, retrieval date and access/provenance register |
| [VALIDATION.json](VALIDATION.json) | Final completeness and consistency checks |

`downloads/<short-name>/` contains raw PDFs/HTML/JSON and `SOURCE.json` metadata. Some attempted downloads returned HTML, 403/404 or a connection/certificate error; these are retained as access evidence, not described as recovered PDFs. `pages.json` and `text.txt` are derived text; `ocr.txt` is marked OCR, not an authoritative transcription. Downloaded documents were not executed.

`work/` contains research extraction/build scripts and scratch evidence. The scripts require Python 3 with requests, beautifulsoup4 and PyMuPDF; OCR also uses Tesseract. The `.sparql` files reproduce the endpoint queries. These scripts are research tooling, not a proposed production ingestion pipeline. Consult row-level scope and evidence before importing any recommendation.
