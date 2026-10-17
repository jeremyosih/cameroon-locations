import json,pathlib,re,unicodedata
R=pathlib.Path(__file__).resolve().parents[1];P=R.parent
load=lambda p:json.loads(p.read_text())
src=lambda n:load(R/'downloads'/n/'SOURCE.json')['url']
canon=load(P/'canonical/adm3-arrondissements.json')
def norm(t):
 t=unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode().lower()
 t=re.sub(r'([1-7])(?:er|st|e|nd|rd|th)\b',r'\1',t)
 for a,b in [('viie','7'),('vie','6'),('iiie','3'),('iie','2'),('1er','1'),('iii','3'),('ii','2')]:t=re.sub(r'\b'+a+r'\b',b,t)
 return re.sub('[^a-z0-9]','',t)
lookup={norm(v):c for c in canon for v in list(c['name'].values())+[a['name'] for a in c['aliases']]}
events=[]
for folder,fn,date,num in [('decree-2007-115','pages.json','2007-04-23','2007/115'),('decree-2010-198','ocr-pages.json','2010-06-16','2010/198')]:
 pages=load(R/'downloads'/folder/fn)
 for p,t in enumerate(pages):
  for m in re.finditer(r'Arrondissement\s+(.{1,65}?)\s*Chef[-· ]?[lL]ieu\s*[:\-]?\s*([^\n]+)',t,re.I):
   name=re.sub(r'^(?:de |du |d[’\'])','',m.group(1)).strip(' ,');seat=m.group(2).strip()
   corrections={'Ile':'IIe','Ille':'IIIe','IlIe':'IIIe','VIle':'VIIe','Njinom':'Njimom','Biwong-BuIu':'Biwong-Bulu','BEDEND':'Bebend','DJEMBEM':'Djebem','NKOLAFAMBA':'Nkolafamba'}
   clean=name
   for a,b in corrections.items():clean=clean.replace(a,b)
   c=lookup.get(norm(clean))
   if c is None:raise ValueError((name,clean))
   renamed={'Douala 6e':'Manoka','Bafoussam 1er':'Bafoussam','Bafoussam 2e':'Baleng','Bafoussam 3e':'Bamougoum'}
   prev=renamed.get(c['name']['fr'])
   events.append({'pcode':c['pcode'],'canonicalName':c['name']['fr'],'eventDate':date,'decree':num,'eventType':'district promoted to arrondissement' if num=='2010/198' else 'replacement designation covering former arrondissement' if prev else 'arrondissement created / territorial reorganization','nameInSource':name,'chefLieuInSource':seat,'predecessor':prev or (name+' district' if num=='2010/198' else None),'evidence':[{'url':src(folder),'quote':m.group(0),'page':p+1,'quoteNote':'PDF text extraction; 2010 scan OCR. Apparent l/I substitutions are retained in quote and normalized only for matching.'}],'confidence':'high','notes':'A legal status date; not the founding date of the settlement or necessarily of the commune. Not a net increment in the national count.'})
ky=next(c for c in canon if norm(c['name']['fr'])=='kyeossi')
events.append({'pcode':ky['pcode'],'canonicalName':ky['name']['fr'],'eventDate':'2006-09-05','decree':'2006/272','eventType':'arrondissement created','nameInSource':'Kye-Ossi','chefLieuInSource':None,'predecessor':None,'evidence':[{'url':'https://istmat.org/files/uploads/63549/annuaire_statistique_du_cameroun_2011.pdf','quote':'Décret N°2006/272 du 05 Septembre 2006 portant création de l’arrondissement de Kye-Ossi.','quoteNote':'INS annuaire legal-text inventory, search-index excerpt; direct download timed out.'},{'url':'https://www.geoecotrop.be/uploads/publications/pub_464_07.pdf','quote':'décret présidentiel N° 2006/272 du 05 septembre 2006, érigeant Kyé-Ossi en arrondissement'}],'confidence':'medium','notes':'Decree number/date corroborated, but the decree itself was not found. Commune creation is a separate 2007 event.'})
from collections import Counter
print(Counter(e['decree'] for e in events),Counter(e['eventType'] for e in events));assert len(events)==106 and len(set(e['pcode'] for e in events))==106
(R/'arrondissement-history.json').write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
coverage=[{'pcode':c['pcode'],'name':c['name']['fr'],'post2005Event':next((e for e in events if e['pcode']==c['pcode']),None),'status':'documented' if any(e['pcode']==c['pcode'] for e in events) else 'not-found in recovered post-2005 acts; not proof of earlier creation'} for c in canon]
(R/'arrondissement-history-coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n')
