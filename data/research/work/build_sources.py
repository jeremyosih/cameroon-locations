import pathlib,json,re,urllib.parse,collections
R=pathlib.Path(__file__).resolve().parents[1]
entries={}
for f in sorted((R/'downloads').glob('*/SOURCE.json')):
 try:m=json.loads(f.read_text())
 except Exception:continue
 url=m['url'];p=f.parent;doc=p/'source.pdf'
 e=entries.setdefault(url,{'url':url,'retrieved':'2026-10-17','access':'downloaded response','copies':[]})
 info={'folder':str(p.relative_to(R)),'httpStatus':m['status'],'contentType':m['contentType'],'sha256':m['sha256'],'bytes':m['bytes']}
 if doc.exists():
  import pymupdf
  info['pages']=len(pymupdf.open(doc))
 e['copies'].append(info)
for f in sorted((R/'downloads').glob('*/error.txt')):
 t=f.read_text();url=t.splitlines()[0]
 if url.startswith('https:'):entries.setdefault(url,{'url':url,'retrieved':'2026-10-17','access':'download failed; indexed evidence may be cited separately','error':t[len(url):].strip(),'copies':[]})
# Citation URLs include useful indexed sources and individual entity links. Distinguish these from downloaded HTML.
urls=set()
for f in [R/'FINDINGS.md',R/'DECISIONS.md']:
 urls.update(re.findall(r'https?://[^\s<>]+',f.read_text()))
# Use structured JSON evidence to avoid ambiguous closing parentheses in Markdown URL parsing.
def collect(x):
 if isinstance(x,dict):
  for k,v in x.items():
   if k in ['url','evidenceUrl','referenceUrl','website'] and isinstance(v,str) and v.startswith('http'):urls.add(v)
   else:collect(v)
 elif isinstance(x,list):
  for a in x:collect(a)
for f in R.glob('*.json'):
 if f.name.startswith('wikidata-query-metadata'):continue
 collect(json.loads(f.read_text()))
# Strip Markdown syntax only for values extracted from prose; structured URLs are re-added below.
urls={v.rstrip(');.,') if v.endswith((');',').',');.')) else v for v in urls}
for f in [R/'FINDINGS.md',R/'DECISIONS.md']:
 # Most citation URLs have no literal parentheses; the few Wikipedia titles are obtained from structured evidence instead.
 for u in re.findall(r'\]\((https?://[^\n]+?)\)(?:[\];., ]|\n|$)',f.read_text()):urls.add(u)
# Normalize residual markdown trailing bracket/parenthesis, retaining known Wikipedia title parentheses.
clean=set()
for url in urls:
 url=url.rstrip('];.,')
 if url.endswith(')') and url.count(')')>url.count('('):url=url[:-1]
 clean.add(url)
for url in clean:
 if url in entries:continue
 derived='www.wikidata.org/wiki/Q' in url
 entries[url]={'url':url,'retrieved':'2026-10-17','access':'entity link; statement data retrieved through SPARQL (page not necessarily opened)' if derived else 'web/indexed source or cited property/reference page; see findings for access limitations','copies':[]}
# Reject malformed prose extractions rather than output invalid links.
entries={u:e for u,e in entries.items() if ']' not in u and not any(ch.isspace() for ch in u)}
(R/'sources.json').write_text(json.dumps(list(entries.values()),ensure_ascii=False,indent=2)+'\n')
head='''# Research source register

Retrieval/review date: **2026-10-17** for all entries. `SOURCE.json` beside each saved response contains its original URL, final URL, HTTP status, SHA-256 and byte length. Failed/HTML responses are not represented as successful PDF downloads. Search-index evidence is identified in the findings when the original URL is unavailable. Downloaded files were treated as documents and were not executed.

Individual Wikidata entity links are separated below: the statements were retrieved through the saved SPARQL queries, and these links do not imply every entity page was opened separately. URLs used only as search-result noise are omitted.

## Downloaded documents and pages, and failed retrievals useful to this audit

| Source | Retrieval | Result / saved copy |
|---|---|---|
'''
lines=[head]
for url,e in entries.items():
 if not e['copies'] and 'failed' not in e['access']:continue
 label=e['copies'][0]['folder'].split('/')[-1] if e['copies'] else urllib.parse.urlparse(url).netloc
 details='; '.join(f"HTTP {c['httpStatus']}, {c.get('pages','—')} pages; [{c['folder']}]({c['folder']}/)" for c in e['copies']) or 'Failed download; see error.txt and findings'
 lines.append(f"| [{label}]({url}) | 2026-10-17 | {details} |")
lines.append('\n## Additional useful web/indexed sources and property references\n')
for url,e in entries.items():
 if e['copies'] or 'failed' in e['access'] or e['access'].startswith('entity link'):continue
 lines.append(f"- [{urllib.parse.urlparse(url).netloc}{urllib.parse.unquote(urllib.parse.urlparse(url).path)}]({url}) — 2026-10-17. {e['access']}.")
lines.append('\n## Wikidata entity evidence links\n\nStatements retrieved 2026-10-17 through SPARQL; see `wikidata-pcodes.json` and `wikidata-enrichment.json` for the P-code and scope of each candidate.\n')
for url,e in entries.items():
 if e['access'].startswith('entity link'):lines.append(f"- [{url.rsplit('/',1)[-1]}]({url}) — 2026-10-17.")
(R/'sources.md').write_text('\n'.join(lines)+'\n')
print('source entries',len(entries),'downloaded',sum(bool(e['copies']) for e in entries.values()))
