from fetch import *
q='''SELECT ?item ?itemLabel ?enLabel ?alias ?type ?parent ?hasc ?cog WHERE {
{ ?item wdt:P31/wdt:P279* wd:Q3076994 } UNION { ?item wdt:P31 wd:Q106698210 } UNION { ?item wdt:P10581 ?cog }
OPTIONAL {?item wdt:P31 ?type} OPTIONAL {?item wdt:P131 ?parent} OPTIONAL {?item wdt:P10581 ?cog}
OPTIONAL {?item rdfs:label ?enLabel FILTER(LANG(?enLabel)="en")}
OPTIONAL {?item skos:altLabel ?alias FILTER(LANG(?alias)="en" || LANG(?alias)="fr")}
SERVICE wikibase:label {bd:serviceParam wikibase:language "fr,en"}
}'''
(ROOT/'wikidata-extra-query.sparql').write_text(q)
print(fetch('wikidata-extra','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})),flush=True)
print(fetch('ins-nomenclature','https://www.stat.cm/nada/index.php/catalog/108/download/924'),flush=True)
