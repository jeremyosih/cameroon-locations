from fetch import *
jobs=[]
for f in sorted((ROOT/'downloads').glob('elecam-page-*/source.html')):
 s=BeautifulSoup(f.read_text(),'html.parser')
 a=s.select_one('[data-downloadurl]')
 if a:jobs.append(('elecam-pdf-'+f.parent.name[-1],a['data-downloadurl'].split('&refresh')[0]))
(ROOT/'work/elecam-pdf-jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for r in ex.map(lambda x:fetch(*x),jobs):print(r,flush=True)
