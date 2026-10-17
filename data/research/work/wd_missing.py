from fetch import *
labels=['Ngaoundéré I','Ngaoundéré II','Ngaoundéré III','Bertoua I','Bertoua II','Nkongsamba I','Édéa II','Douala II','Douala III','Douala IV','Douala VI','Garoua I','Garoua II','Garoua III','Barndaké','Bamenda III','Bayangam','Dschang','Éséka','Pète-Bandjoun','Ebolowa I','Ebolowa II','Kribi Ier','Kribi IIe','Lokoundjé','Buéa','Limbé Ier','Kumba I','Kumba II','Kumba III','Bafoussam III','Baré-Bakem','Elak-Oku']
values=' '.join(json.dumps(x,ensure_ascii=False)+'@'+lang for x in labels for lang in ['fr','en'])
q='''SELECT ?item ?itemLabel ?type ?parent ?parentLabel ?geonames ?cog ?coord ?website WHERE {
VALUES ?label { '''+values+''' }
?item rdfs:label ?label . OPTIONAL {?item wdt:P31 ?type} OPTIONAL {?item wdt:P131 ?parent}
OPTIONAL {?item wdt:P1566 ?geonames} OPTIONAL {?item wdt:P10581 ?cog} OPTIONAL {?item wdt:P625 ?coord}
OPTIONAL {?item wdt:P856 ?website}
SERVICE wikibase:label {bd:serviceParam wikibase:language "fr,en"}
}'''
(ROOT/'wikidata-missing-query.sparql').write_text(q)
print(fetch('wikidata-missing','https://query.wikidata.org/sparql?'+requests.compat.urlencode({'query':q,'format':'json'})))
