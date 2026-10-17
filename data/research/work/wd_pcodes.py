from fetch import *
q='''SELECT ?item ?itemLabel ?pcode ?type ?parent ?hasc ?geonames ?cog ?coord ?capital ?website WHERE {
?item wdt:P14503 ?pcode . FILTER(STRSTARTS(STR(?pcode),"CM"))
OPTIONAL {?item wdt:P31 ?type} OPTIONAL {?item wdt:P131 ?parent}
OPTIONAL {?item wdt:P8119 ?hasc} OPTIONAL {?item wdt:P1566 ?geonames} OPTIONAL {?item wdt:P10581 ?cog}
OPTIONAL {?item wdt:P625 ?coord} OPTIONAL {?item wdt:P36 ?capital} OPTIONAL {?item wdt:P856 ?website}
SERVICE wikibase:label {bd:serviceParam wikibase:language "fr,en"}
}'''
(ROOT/'wikidata-pcodes-query.sparql').write_text(q)
print(fetch('wikidata-ocha-pcodes','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})))
