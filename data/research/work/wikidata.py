from fetch import *
q='''SELECT ?item ?itemLabel ?type ?parent ?parentLabel ?geonames ?hasc ?cog ?coord ?capital ?capitalLabel ?website WHERE {
VALUES ?type { wd:Q106698210 wd:Q2306813 wd:Q869042 wd:Q3076994 }
?item wdt:P31 ?type .
OPTIONAL { ?item wdt:P131 ?parent }
OPTIONAL { ?item wdt:P1566 ?geonames }
OPTIONAL { ?item wdt:P8119 ?hasc }
OPTIONAL { ?item wdt:P10581 ?cog }
OPTIONAL { ?item wdt:P625 ?coord }
OPTIONAL { ?item wdt:P36 ?capital }
OPTIONAL { ?item wdt:P856 ?website }
SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
}'''
(ROOT/'wikidata-query.sparql').write_text(q)
url='https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})
print(fetch('wikidata-sparql',url),flush=True)
print(fetch('elecam-documentation','https://portail.elecam.cm/fr/documentation/'),flush=True)
