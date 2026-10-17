from fetch import *
from bs4 import BeautifulSoup
soup=BeautifulSoup((ROOT/'downloads/elecam-documentation/source.html').read_text(),'html.parser')
jobs=[]
for a in soup.select('a[href]'):
 t=a.get_text(' ',strip=True)
 if ('LISTE BV' in t or 'LIST OF PS' in t):
  card=a
  for _ in range(5):
   if card.select('[data-downloadurl]') or card.select('[data-download-url]'):break
   card=card.parent
  print(t, str(card)[:2500],flush=True)
  jobs.append(('elecam-page-'+t[:1].lower(),a['href']))
(ROOT/'work/elecam-jobs.json').write_text(json.dumps(jobs))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for r in ex.map(lambda x:fetch(*x),jobs):print(r,flush=True)
