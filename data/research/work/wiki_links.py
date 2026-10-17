from fetch import *
import unicodedata,re
soup=BeautifulSoup((ROOT/'downloads/wiki-communes/source.html').read_text(),'html.parser')
rows=[]
for tr in soup.select('table tr'):
 cells=tr.select('td')
 if len(cells)==3:
  a=cells[0].find('a',href=True)
  if a:rows.append({'name':cells[0].get_text(' ',strip=True),'division':cells[1].get_text(' ',strip=True),'region':cells[2].get_text(' ',strip=True),'url':requests.compat.urljoin('https://fr.wikipedia.org',a['href'])})
(ROOT/'work/wiki-commune-table.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('table rows',len(rows))
for r in rows:
 if any(s in r['name'].lower() for s in ['ngaound','bertoua','douala','nkongsamba','garoua','kribi','kumba','bolowa','eséka','bayangam','dschang','buéa','barnd','elak','bandjoun','lokound','bamenda','limb']): print(r)
