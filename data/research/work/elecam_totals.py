import pathlib,json,re,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
rows=[];errors=[]
for d in sorted((ROOT/'downloads').glob('elecam-pdf-*')):
 f=d/'pages.json'
 if not f.exists():continue
 pages=json.loads(f.read_text());meta=json.loads((d/'SOURCE.json').read_text());council=None;division=None;region=None
 for i,t in enumerate(pages):
  for line in t.splitlines():
   if 'COMMUNE:' in line:
    m=re.search(r'COMMUNE:\s*(.+)',line)
    if m:council=m.group(1).split('REGION:')[0].strip()
    m=re.search(r'DEPARTEMENT:\s*(.+?)\s+COMMUNE:',line)
    if m:division=m.group(1).strip()
    m=re.search(r'REGION:\s*(.+?)\s+DEPARTEMENT:',line)
    if m:region=m.group(1).strip()
   if 'Total bureaux' in line:
    m=re.search(r'Polling stations\s*:\s*([\d ]+).*?voters\s*:\s*([\d ]+)',line)
    if m:
     rows.append({'region':region,'division':division,'council':council,'stations':int(m[1].replace(' ','')),'voters':int(m[2].replace(' ','')),'pdfPage':i+1,'url':meta['url'],'sourceFolder':d.name,'quote':line.strip()})
    else:errors.append({'file':d.name,'page':i+1,'text':line})
 print(d.name,'pages',len(pages),'text pages',sum(bool(t.strip()) for t in pages),'totals',sum(x['sourceFolder']==d.name for x in rows))
(ROOT/'elecam-2025-published-council-totals.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));(ROOT/'work/elecam-total-errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
print('rows',len(rows),'voters',sum(x['voters'] for x in rows),'stations',sum(x['stations'] for x in rows),'errors',errors[:3]);print('sample',rows[:2])
# The Littoral PDF repeats Dibamba and Dibombari. Preserve page provenance but count each council once.
by={}
for r in rows:
 k=(r['region'],r['division'],r['council'])
 if k in by:
  assert (r['stations'],r['voters'])==(by[k]['stations'],by[k]['voters'])
  by[k].setdefault('duplicatePdfPages',[]).append(r['pdfPage'])
 else:by[k]=r
rows=list(by.values())
import unicodedata
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
canonical=json.loads((ROOT.parent/'canonical/adm3-arrondissements.json').read_text())
regions={'ADAMAOUA':'CM001','CENTRE':'CM002','EST':'CM003','EXTREME-NORD':'CM004','LITTORAL':'CM005','NORD':'CM006','NORD-OUEST':'CM007','OUEST':'CM008','SUD':'CM009','SUD-OUEST':'CM010'}
for r in rows:
 cand=[c for c in canonical if c['pcode'].startswith(regions[r['region']]) and norm(r['council']) in {norm(c.get('elecam2025',{}).get('council','')),*[norm(a['name']) for a in c['aliases']]}]
 r['pcode']=cand[0]['pcode'] if len(cand)==1 else None
 r['verification']='published footer transcribed; not independently summed from every station'
 if len(cand)==1:
  old=cand[0].get('elecam2025',{});r['localDatasetVoters']=old.get('registeredVoters');r['localDatasetStations']=old.get('pollingStations');r['voterDeltaVsLocal']=r['voters']-old['registeredVoters'] if isinstance(old.get('registeredVoters'),int) else None
(ROOT/'elecam-2025-published-council-totals.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('deduplicated',len(rows),'voters',sum(x['voters'] for x in rows),'stations',sum(x['stations'] for x in rows),'unmatched',[(x['region'],x['council']) for x in rows if not x['pcode']])
