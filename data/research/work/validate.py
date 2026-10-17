import pathlib,json,collections,subprocess,re
R=pathlib.Path(__file__).resolve().parents[1];P=R.parent
load=lambda p:json.loads(p.read_text())
checks=[]
def check(name,condition,detail=None):
 checks.append({'check':name,'passed':bool(condition),'detail':detail})
 if not condition:raise AssertionError((name,detail))
manual=load(P/'crosswalks/elecam-codab.json')['manual'];cw=load(R/'elecam-crosswalk-verification.json')
check('all 39 manual keys represented exactly once',len(cw)==39 and {r['key'] for r in cw}==set(manual))
check('manual P-codes unchanged',all(r['pcode']==manual[r['key']]['pcode'] for r in cw))
check('crosswalk verdicts and evidence valid',all(r['verdict'] in ['confirmed','contradicted','not-found'] and r['evidence'] and all(e['url'].startswith('https://') and e['quote'] for e in r['evidence']) for r in cw))
issues=load(P/'canonical/issues.json');names=load(R/'official-names.json')
check('all 52 name-variant P-codes covered',len(names)==52 and {r['pcode'] for r in names}=={x['pcode'] for x in issues if x['kind']=='name-variants'})
check('all name recommendations have evidence',all(r['evidence'] and r['confidence'] for r in names))
canon=[c for f in ['adm1-regions','adm2-divisions','adm3-arrondissements'] for c in load(P/f'canonical/{f}.json')];pcs={c['pcode'] for c in canon}
wd=load(R/'wikidata-pcodes.json')
check('428 P-codes covered exactly once',len(wd)==428 and {r['pcode'] for r in wd}==pcs)
qids=[r['qid'] for r in wd if r['qid']]
check('no duplicate QIDs across P-codes',len(qids)==len(set(qids)),len(qids))
check('11 unresolved QIDs explicitly not found',sum(r['qid'] is None for r in wd)==11)
check('QID match scope recorded',all(r.get('entityScope') and r.get('matchMethod') for r in wd))
hist=load(R/'arrondissement-history.json');hc=load(R/'arrondissement-history-coverage.json')
check('106 distinct documented event P-codes',len(hist)==106 and len({r['pcode'] for r in hist})==106)
check('history decree counts',collections.Counter(r['decree'] for r in hist)=={'2007/115':51,'2010/198':54,'2006/272':1})
check('history covers 360 with explicit unresolved status',len(hc)==360 and len({r['pcode'] for r in hc})==360)
el=load(R/'elecam-2025-published-council-totals.json')
check('326 unique mapped published councils',len(el)==326 and len({r['pcode'] for r in el})==326 and all(r['pcode'] for r in el))
check('ELECAM subtotal arithmetic',sum(r['voters'] for r in el)==7350565 and sum(r['stations'] for r in el)==29024)
for r in el:
 check('source page exists for '+r['pcode'],r['pdfPage']<=len(load(R/'downloads'/r['sourceFolder']/'pages.json')))
for c in ['a','b','c','d','e','f','g','h','i','j','k']:
 f=R/'downloads'/('elecam-pdf-'+c)/'source.pdf';check('actual ELECAM PDF '+c,f.read_bytes().startswith(b'%PDF'))
p=load(R/'downloads/bucrep-ins-2025/pages.json');q=load(R/'downloads/bucrep-ireda/pages.json');normalize=lambda t:re.sub(r'\s+','',t)
check('all 436 recovered BUCREP page texts match',len(p)==len(q)==436 and all(normalize(a)==normalize(b) for a,b in zip(p,q)))
check('eight findings sections',len(re.findall(r'^## [1-8]\. ',(R/'FINDINGS.md').read_text(),re.M))==8)
check('all top-level JSON parses',all(load(f) is not None for f in R.glob('*.json')))
status=subprocess.check_output(['git','status','--porcelain'],cwd=P,text=True)
check('only research is changed/untracked',all(line[3:].startswith('research/') for line in status.splitlines()),status.strip())
result={'retrieved':'2026-10-17','status':'passed','checkCount':len(checks),'summary':{'manualDecisions':39,'nameIssues':52,'historyEvents':106,'historyCoverage':360,'wikidataCoverage':428,'populatedQids':417,'unresolvedQids':11,'publishedCouncilTotals':326,'rawElecamPdfs':11},'checks':checks}
(R/'VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checkCount':len(checks),'summary':result['summary']},indent=2))
