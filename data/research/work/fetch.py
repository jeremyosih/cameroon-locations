import requests,pathlib,json,hashlib,concurrent.futures,sys
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[1]
HEAD={'User-Agent':'CameroonAdministrativeResearch/1.0 (reference verification; noncommercial)'}
def fetch(name,url):
 d=ROOT/'downloads'/name;d.mkdir(exist_ok=True,parents=True)
 try:
  r=requests.get(url,headers=HEAD,timeout=55,verify=('elecam.cm' not in url));ct=r.headers.get('Content-Type',''); ext='pdf' if r.content.startswith(b'%PDF') else 'html' if 'html' in ct else 'json' if 'json' in ct else 'bin'
  (d/('raw.'+ext) if ext=='json' else d/('source.'+ext)).write_bytes(r.content)
  meta={'url':url,'finalUrl':r.url,'retrieved':'2026-10-17','status':r.status_code,'contentType':ct,'bytes':len(r.content),'sha256':hashlib.sha256(r.content).hexdigest()}
  (d/'SOURCE.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
  if ext=='pdf':
   import fitz
   doc=fitz.open(stream=r.content,filetype='pdf');pages=[p.get_text(sort=True) for p in doc]
   (d/'pages.json').write_text(json.dumps(pages,ensure_ascii=False));(d/'text.txt').write_text('\n\f\n'.join(pages));meta['pages']=len(pages)
  elif ext=='html':
   soup=BeautifulSoup(r.content,'html.parser');(d/'text.txt').write_text(soup.get_text(' ',strip=True));(d/'links.json').write_text(json.dumps([{'text':a.get_text(' ',strip=True),'url':requests.compat.urljoin(r.url,a.get('href',''))} for a in soup.select('a[href]')],ensure_ascii=False,indent=2))
  return name,meta
 except Exception as e:
  (d/'error.txt').write_text(url+'\n'+str(e));return name,str(e)
if __name__=='__main__':
 jobs=json.loads(pathlib.Path(sys.argv[1]).read_text())
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
  for result in ex.map(lambda a:fetch(*a),jobs):print(json.dumps(result,ensure_ascii=False),flush=True)
