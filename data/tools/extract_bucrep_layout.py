# Independent extraction of the BUCREP village directory straight from the PDF layout (PyMuPDF).
# Each table row is rebuilt from word positions; level comes from typography, not text indentation:
#   bold + x≈indent of arrondissement total, bold canton rows (shaded), regular village rows.
# Output: one JSON row per table line with page, y, x of the name, bold flag, name, total/male/female.
# Usage: uv run --with pymupdf python -I extract_bucrep_layout.py <loc.pdf> <out.json>
import json, re, sys
import pymupdf

doc = pymupdf.open(sys.argv[1])
rows, headers = [], []
num_re = re.compile(r"^(-|\d+)$")

for pno in range(len(doc)):
    page = doc[pno]
    lines = {}
    for block in page.get_text("rawdict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                chars = [c for c in span["chars"] if c["c"].strip()]
                t = "".join(c["c"] for c in span["chars"]).strip()
                if not chars:
                    continue
                y = round((span["bbox"][1] + span["bbox"][3]) / 2)
                key = next((k for k in lines if abs(k - y) <= 2), y)
                lines.setdefault(key, []).append({"x": chars[0]["bbox"][0], "x1": span["bbox"][2], "t": t, "bold": bool(span["flags"] & 16) or "Bold" in span["font"], "font": span["font"]})
    for y in sorted(lines):
        spans = sorted(lines[y], key=lambda s: s["x"])
        text = " ".join(s["t"] for s in spans)
        if re.match(r"^\d+(\.\d+)*\.? *(REGION|R[ÉE]GION|DEPARTEMENT|D[ÉE]PARTEMENT|ARRONDIS+E?MENT)", text):
            headers.append({"page": pno + 1, "docPage": pno + 10, "y": y, "text": text})
            continue
        name_spans = [s for s in spans if s["x"] < 330]
        num_spans = [s for s in spans if s["x"] >= 330]
        nums = " ".join(s["t"] for s in num_spans).split()
        if not name_spans or len(nums) != 3 or not all(num_re.match(n) for n in nums):
            continue
        name = " ".join(s["t"] for s in name_spans)
        if name in ("Total", "Quartiers / Villages"):
            continue
        rows.append({"page": pno + 1, "docPage": pno + 10, "y": y, "x": round(name_spans[0]["x"], 1),
                     "bold": all(s["bold"] for s in name_spans), "name": name,
                     "total": None if nums[0] == "-" else int(nums[0]), "male": None if nums[1] == "-" else int(nums[1]),
                     "female": None if nums[2] == "-" else int(nums[2])})

json.dump({"headers": headers, "rows": rows}, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
from collections import Counter
print("headers", len(headers), "rows", len(rows))
print("x/bold distribution", Counter((round(r["x"]), r["bold"]) for r in rows).most_common(12))
