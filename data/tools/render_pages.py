# Render PDF pages to PNG for visual verification: render_pages.py <pdf> <outdir> <page> [<page>...]
import sys, pymupdf
doc = pymupdf.open(sys.argv[1])
for p in sys.argv[3:]:
    doc[int(p) - 1].get_pixmap(dpi=110).save(f"{sys.argv[2]}/page-{p}.png")
print("pages in pdf:", len(doc))
