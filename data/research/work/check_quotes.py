import json,pathlib,re,unicodedata,hashlib
R=pathlib.Path(__file__).resolve().parents[1]
index={}
for f in (R/'downloads').glob('*/SOURCE.json'):
 m=json.loads(f.read_text());d=f.parent;t=d/'ocr.txt' if (d/'ocr.txt').exists() else d/'text.txt'
 if t.exists():index[m['url']]=t.read_text()
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s)).strip()
rows=json.loads((R/'elecam-crosswalk-verification.json').read_text());jobs=[]
for r in rows:
 for e in r['evidence']:
  t=index.get(e['url'])
  if t is None:jobs.append(('evidence-'+r['councilName'].lower().replace(' ','-').replace("'",'')+'-'+hashlib.sha1(e['url'].encode()).hexdigest()[:7],e['url']));print('NOFILE',r['councilName'],e['url'])
  elif norm(e['quote']) not in norm(t):print('NOTLITERAL',r['councilName'],e['quote'])
(R/'work/evidence-jobs.json').write_text(json.dumps(jobs,ensure_ascii=False))
