import pathlib,sys,subprocess,concurrent.futures,json
import pymupdf
p=pathlib.Path(sys.argv[1]);doc=pymupdf.open(p/'source.pdf')
jobs=[]
for i,page in enumerate(doc):
 f=p/f'page-{i+1:03}.png';page.get_pixmap(dpi=180).save(f);jobs.append((i,f))
def job(x):
 i,f=x;r=subprocess.run(['tesseract',str(f),'stdout','-l','eng'],capture_output=True,text=True);return i,r.stdout
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:r=sorted(ex.map(job,jobs))
(p/'ocr-pages.json').write_text(json.dumps([t for _,t in r],ensure_ascii=False));(p/'ocr.txt').write_text('\n\f\n'.join(t for _,t in r));print('OCR complete',p,len(r))
