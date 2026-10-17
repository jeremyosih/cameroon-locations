from fetch import *
mapping=json.loads((ROOT/'wikidata-pcodes.json').read_text());qs=[r['qid'] for r in mapping if r['qid']]
jobs=[]
for i in range(0,len(qs),90):
 q='''SELECT ?item ?country ?type ?typeLabel ?geonames ?hasc ?cog ?pcode ?coord ?capital ?capitalLabel ?website ?pop ?date ?referenceUrl ?statedIn WHERE {
 VALUES ?item { '''+' '.join('wd:'+v for v in qs[i:i+90])+''' }
 OPTIONAL {?item wdt:P17 ?country} OPTIONAL {?item wdt:P31 ?type}
 OPTIONAL {?item wdt:P1566 ?geonames} OPTIONAL {?item wdt:P8119 ?hasc} OPTIONAL {?item wdt:P10581 ?cog}
 OPTIONAL {?item wdt:P14503 ?pcode} OPTIONAL {?item wdt:P625 ?coord} OPTIONAL {?item wdt:P36 ?capital}
 OPTIONAL {?item wdt:P856 ?website}
 OPTIONAL {?item p:P1082 ?statement . ?statement ps:P1082 ?pop; pq:P585 ?date . FILTER(YEAR(?date)=2005)
 OPTIONAL {?statement prov:wasDerivedFrom ?ref . OPTIONAL {?ref pr:P854 ?referenceUrl} OPTIONAL {?ref pr:P248 ?statedIn}} }
 SERVICE wikibase:label {bd:serviceParam wikibase:language "fr,en"}
 }'''
 (ROOT/f'wikidata-enrichment-{i//90+1}-query.sparql').write_text(q)
 jobs.append((f'wikidata-enrichment-{i//90+1}','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
 for result in ex.map(lambda a:fetch(*a),jobs):print(result,flush=True)
