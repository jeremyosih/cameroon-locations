from fetch import *
q='''SELECT ?item ?itemLabel ?type ?parent ?geonames ?cog ?coord ?website WHERE {
?item wdt:P17 wd:Q1009; rdfs:label ?label . FILTER(LANG(?label) IN ("fr","en"))
FILTER(REGEX(STR(?label),"Ngaound|Garoua|Kumba|Bertoua|déa|Ebolowa|Buea|Buéa","i"))
OPTIONAL {?item wdt:P31 ?type} OPTIONAL {?item wdt:P131 ?parent}
OPTIONAL {?item wdt:P1566 ?geonames} OPTIONAL {?item wdt:P10581 ?cog} OPTIONAL {?item wdt:P625 ?coord}
OPTIONAL {?item wdt:P856 ?website}
SERVICE wikibase:label {bd:serviceParam wikibase:language "fr,en"}
}'''
(ROOT/'wikidata-numbered-query.sparql').write_text(q)
print(fetch('wikidata-numbered','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})))
q='''SELECT ?property ?propertyLabel WHERE {
?property a wikibase:Property; rdfs:label ?label . FILTER(LANG(?label)="en")
FILTER(REGEX(STR(?label),"OCHA|HASC|p-code|P code|humanitarian|Cameroun|GeoNames","i"))
SERVICE wikibase:label {bd:serviceParam wikibase:language "en"}
}'''
(ROOT/'wikidata-properties-query.sparql').write_text(q)
print(fetch('wikidata-properties','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})))
