import json,pathlib,collections
R=pathlib.Path(__file__).resolve().parents[1]
load=lambda p:json.loads(p.read_text())
maprows=load(R/'wikidata-pcodes.json');canonical={c['pcode']:c for f in ['adm1-regions','adm2-divisions','adm3-arrondissements'] for c in load(R.parent/f'canonical/{f}.json')}
items={}
for f in (R/'downloads').glob('wikidata-enrichment-*/raw.json'):
 for rr in load(f)['results']['bindings']:
  row={k:v['value'] for k,v in rr.items()};q=row.pop('item').rsplit('/',1)[-1];x=items.setdefault(q,{})
  for k in ['country','geonames','hasc','cog','pcode','coord','capital','website']:
   if k in row and row[k] not in x.setdefault(k,[]):x[k].append(row[k])
  if 'type' in row:
   obj={'qid':row['type'].rsplit('/',1)[-1],'label':row.get('typeLabel')}
   if obj not in x.setdefault('types',[]):x['types'].append(obj)
  if 'pop' in row:
   obj={k:row[k] for k in ['pop','date','referenceUrl','statedIn'] if k in row}
   if obj not in x.setdefault('population2005Statements',[]):x['population2005Statements'].append(obj)
  if 'capital' in row:
   obj={k:row[k] for k in ['capital','capitalLabel'] if k in row}
   if obj not in x.setdefault('capitalLabels',[]):x['capitalLabels'].append(obj)
out=[]
for m in maprows:
 if not m['qid']:continue
 x=items.get(m['qid'],{});countries=x.get('country',[])
 if any(v!='http://www.wikidata.org/entity/Q1009' for v in countries):print('COUNTRY MISMATCH',m['pcode'],m['qid'],countries)
 out.append({'pcode':m['pcode'],'level':m['level'],'qid':m['qid'],'label':m['label'],'entityScope':m['entityScope'],'evidenceUrl':m['evidenceUrl'],**x,'canonicalPopulation2005':canonical[m['pcode']].get('population2005',{}).get('total'),'importRecommendation':'Candidate enrichment only. Check entity extent, population date and references; coordinates may locate a town, not an administrative centroid.'})
(R/'wikidata-enrichment.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
meta={'retrieved':'2026-10-17','endpoint':'https://query.wikidata.org/sparql','totalPcodes':len(maprows),'matchedByLevel':dict(collections.Counter(r['level'] for r in maprows if r['qid'])),'unmatched':[{'pcode':r['pcode'],'name':r['canonicalName']} for r in maprows if not r['qid']],'entityScopeCounts':dict(collections.Counter(r['entityScope'] for r in maprows if r['qid'])),'enrichmentAvailability':dict(collections.Counter(k for r in out for k in ['coord','capital','website','population2005Statements','geonames','hasc','cog'] if r.get(k))),'ochaProperty':'P14503','cameroonOchaBindings':len(load(R/'downloads/wikidata-ocha-pcodes/raw.json')['results']['bindings']),'queries':[{ 'file':f.name,'query':f.read_text()} for f in sorted(R.glob('*.sparql'))],'limitations':['Name-based ADM3 candidates are not all distinct arrondissement entities.','No Cameroon P14503 assignments returned; this is query coverage, not proof none exist in unindexed revisions.','Null QIDs mean not found in the executed queries, not proof no item exists.']}
(R/'wikidata-query-metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(meta['matchedByLevel']);print(meta['entityScopeCounts']);print(meta['enrichmentAvailability'])
