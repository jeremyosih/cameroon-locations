# Compare normalized text of `ours` against pages of `full` (offset search) and grep a phrase in a PDF.
# Usage: pdf_text_compare.py compare <ours.pdf> <full.pdf> | grep <pdf> <regex>
import re, sys, pymupdf
norm = lambda s: re.sub(r"\s+", " ", s).strip()
if sys.argv[1] == "compare":
    a, b = pymupdf.open(sys.argv[2]), pymupdf.open(sys.argv[3])
    A = [norm(p.get_text()) for p in a]; B = [norm(p.get_text()) for p in b]
    off = next(o for o in range(len(B)) if B[o] == A[0])
    same = sum(1 for i in range(len(A)) if i + off < len(B) and A[i] == B[i + off])
    print(f"ours {len(A)} pages, full {len(B)} pages, offset {off}, identical pages {same}/{len(A)}")
else:
    d = pymupdf.open(sys.argv[2])
    for i, p in enumerate(d):
        t = p.get_text()
        for m in re.finditer(sys.argv[3], t, re.I):
            print(f"p{i+1}: ...{norm(t[max(0,m.start()-250):m.end()+120])}...")
