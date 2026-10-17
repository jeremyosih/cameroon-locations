import pathlib,json,re,unicodedata,collections
ROOT=pathlib.Path(__file__).resolve().parents[1];POOL=ROOT.parent
rows=json.loads((ROOT/'downloads/wikidata-sparql/raw.json').read_text())['results']['bindings']
rows+=json.loads((ROOT/'downloads/wikidata-extra/raw.json').read_text())['results']['bindings']
rows+=json.loads((ROOT/'downloads/wikidata-missing/raw.json').read_text())['results']['bindings']
rows+=json.loads((ROOT/'downloads/wikidata-numbered/raw.json').read_text())['results']['bindings']
rows+=json.loads((ROOT/'downloads/wikidata-ocha-pcodes/raw.json').read_text())['results']['bindings']
items={}
for row in rows:
 r={k:v['value'] for k,v in row.items()};qid=r['item'].split('/')[-1]
 x=items.setdefault(qid,{'qid':qid,'label':r.get('itemLabel'),'types':[],'parents':[],'hasc':[],'geonames':[],'cog':[],'coords':[],'capitals':[],'websites':[],'labels':[],'pcodes':[]})
 for key,col in [('pcode','pcodes'),('type','types'),('parent','parents'),('hasc','hasc'),('geonames','geonames'),('cog','cog'),('coord','coords'),('capital','capitals'),('website','websites'),('enLabel','labels'),('alias','labels'),('itemLabel','labels')]:
  if key in r and r[key] not in x[col]:x[col].append(r[key])
def norm(t):
 t=unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode().lower()
 t=re.sub(r'\b(region|department|departement|division|cameroun|cameroon)\b','',t)
 t=re.sub(r'\b([ivx]+)\s*(er|e|eme)\b',r'\1',t);t=re.sub(r'\b1(er|st)\b','1',t);t=re.sub(r'\b([2-7])(nd|rd|th|e|eme)\b',r'\1',t)
 for n,roman in [(7,'vii'),(6,'vi'),(5,'v'),(4,'iv'),(3,'iii'),(2,'ii'),(1,'i')]:t=re.sub(r'\b'+roman+r'\b',str(n),t)
 return re.sub(r'[^a-z0-9]','',t)
canon=[]
for name in ['adm1-regions','adm2-divisions','adm3-arrondissements']:canon+=json.loads((POOL/f'canonical/{name}.json').read_text())
result=[]
for c in canon:
 level=c['level'];names={norm(n) for n in list(c['name'].values())+[c['refName']]+[a['name'] for a in c['aliases']]}
 extra={'CM006001009':['Barndaké'],'CM007002006':['Elak-Oku'],'CM008004003':['Bandjoun','Pète-Bandjoun'],'CM009003006':['Lokundje','Lokoundjé']}
 names.update(norm(n) for n in extra.get(c['pcode'],[]))
 candidates=[];hasc=c.get('hasc',{}).get('code')
 targettype={1:'Q869042',2:'Q2306813',3:'Q3076994'}[level]
 for q,x in items.items():
  if q=='Q1018402':continue # motor ship Buéa, unrelated homonym; verified entity data
  if level<3 and not any(t.endswith('/'+targettype) for t in x['types']):continue
  if level==3 and any(t.endswith('/Q2306813') or t.endswith('/Q869042') for t in x['types']):continue
  if c['pcode'] in x['pcodes']:candidates.append((q,'exact OCHA P-code P14503'))
  elif hasc and hasc in x['hasc']:candidates.append((q,'exact HASC P8119'))
  elif any(norm(v) in names for v in x['labels']):candidates.append((q,'normalized canonical/alias/council label; entity type checked'))
 candidates=list(dict.fromkeys(candidates))
 # prefer parent department QID if available; commune items may instead name region
 parent=next((r for r in result if r['pcode']==c.get('parentPcode')),None)
 if parent and parent['qid']:
  direct=[(q,m) for q,m in candidates if 'http://www.wikidata.org/entity/'+parent['qid'] in items[q]['parents']]
  if direct:candidates=[(q,m+'; P131 parent matched') for q,m in direct]
 exact=[(q,m) for q,m in candidates if norm(items[q]['label'])==norm(c['name']['fr'])]
 if exact:candidates=exact
 arrtyped=[(q,m) for q,m in candidates if 'http://www.wikidata.org/entity/Q106698210' in items[q]['types']]
 communes=[(q,m) for q,m in candidates if 'http://www.wikidata.org/entity/Q3076994' in items[q]['types']]
 if arrtyped:candidates=arrtyped
 elif communes:candidates=communes
 if len(candidates)==1:q,m=candidates[0]
 else:q,m=None,'not-found' if not candidates else 'ambiguous'
 if q and level==3:
  m=m.replace('; entity type checked','; entity type recorded (see entityScope)')
  if q in ['Q312209','Q289267','Q3591508','Q2892201']:m+='; commune/locality candidate, not proven distinct arrondissement QID'
 result.append({'pcode':c['pcode'],'level':level,'qid':q,'label':items[q]['label'] if q else c['name']['fr'],'matchMethod':m,'canonicalName':c['name']['fr'],'entityTypes':items[q]['types'] if q else [],'evidenceUrl':'https://www.wikidata.org/wiki/'+q if q else None,'candidateQids':[a for a,b in candidates],'entityScope':('arrondissement' if q and any(t.endswith('/Q106698210') for t in items[q]['types']) else 'commune (may also represent town)' if q and level==3 and any(t.endswith('/Q3076994') for t in items[q]['types']) else 'locality or administrative-unit candidate; manual scope check required' if q and level==3 else 'region' if q and level==1 else 'department' if q and level==2 else 'not-found'),'importStatus':'candidate; verify scope before importing' if level==3 else 'matched' if q else 'not-found'})
(ROOT/'work/wikidata-items.json').write_text(json.dumps(items,ensure_ascii=False,indent=2));(ROOT/'wikidata-pcodes.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print('distinct by type',collections.Counter(t.rsplit('/',1)[-1] for x in items.values() for t in x['types']))
print('matched by level',collections.Counter(r['level'] for r in result if r['qid']))
for r in result:
 if not r['qid']: print(r['pcode'],r['label'],r['matchMethod'],[(q,items[q]['label']) for q in r['candidateQids']])
