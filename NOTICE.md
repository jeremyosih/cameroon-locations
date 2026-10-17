# Data sources and attribution

The code is MIT-licensed (see `LICENSE`, shipped in this package). The MIT
licence covers the code only: the data shipped in this package is derived from
the sources below, which keep their own terms. If you display or
redistribute the data, credit the sources you use. `attribution()` and
`sources` in the package return this text, and every GeoJSON file carries the
boundary credit in its `metadata` member.

Archived copies, checksums and full provenance are in the repository:
https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources

| Data | Source | Licence | Online | Archived copy |
|---|---|---|---|---|
| Boundaries, P-codes, region/division/arrondissement names, areas, centroids | OCHA COD-AB Cameroon v01 (Institut National de Cartographie / OCHA) | [CC BY-IGO 3.0](https://creativecommons.org/licenses/by/3.0/igo/) | https://data.humdata.org/dataset/cod-ab-cmr | [`data/sources/ocha-cod-ab-cmr`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources/ocha-cod-ab-cmr) |
| Cantons, villages, 2005 population | BUCREP, 3e RGPH 2005, Répertoire actualisé des villages du Cameroun | Government publication, no licence stated; facts republished with attribution | https://ins-cameroun.cm/wp-content/uploads/2025/06/Repertoire_actualise_villages_cameroun1-3.pdf | [`data/sources/bucrep-rgph2005-repertoire-villages`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources/bucrep-rgph2005-repertoire-villages) |
| Polling stations, registered voters | ELECAM 2025 electoral roll by polling station: a CSV dated 2025-07-24, probably the July 2025 provisional roll; download origin not recorded | Public notice, no licence stated; facts republished with attribution | ELECAM publishes the official lists as PDFs at https://portail.elecam.cm/fr/documentation/ | [`data/sources/elecam-polling-stations-2025`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources/elecam-polling-stations-2025) |
| Alternative spellings (aliases) and evidence for accented names; boundaries used for cross-checks only | geoBoundaries gbOpen CMR (Runfola et al. 2020); ADM3 derived from OpenStreetMap | ADM1 CC BY 3.0, ADM2 CC BY 4.0, ADM3 ODbL 1.0 (© OpenStreetMap contributors). No geometry is republished | https://www.geoboundaries.org | [`data/sources/geoboundaries-cmr-gbopen`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources/geoboundaries-cmr-gbopen) |
| HASC codes | Statoids (Gwillim Law), via the location-script reference tables | Facts republished with attribution | https://www.statoids.com/ucm.html | [`data/sources/location-script-reference-tables`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/sources/location-script-reference-tables) |
| Historic spellings (aliases) | cameroon-locations 0.1.0 (July 2025 export) | MIT | [`data/derived/location-script-2025-07`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/derived/location-script-2025-07) | same |
| Wikidata identifiers | Wikidata | CC0 1.0 | https://www.wikidata.org | [`data/research`](https://github.com/jeremyosih/cameroon-locations/tree/main/data/research) |
| Official spellings, history | Project research notes citing decrees 2007/115, 2008/376, 2010/198 | MIT | [`data/research/FINDINGS.md`](https://github.com/jeremyosih/cameroon-locations/blob/main/data/research/FINDINGS.md) | same |

Suggested credit line for maps:

> Boundaries: OCHA COD-AB Cameroon (INC / OCHA), CC BY-IGO. Villages and
> population: BUCREP RGPH 2005. Via cameroon-locations.
