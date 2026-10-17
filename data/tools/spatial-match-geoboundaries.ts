// Independent spatial match: for each geoBoundaries ADM3 shape (pristine upstream file, no P-codes),
// sample a grid of points inside it and find which COD-AB ADM3 polygon contains the majority of them.
const [gbPath, codabPath, outPath] = process.argv.slice(2);
type Ring = number[][]; type Poly = Ring[];
const polys = (g: any): Poly[] => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const inRing = (x: number, y: number, r: Ring) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const inGeom = (x: number, y: number, ps: Poly[]) => ps.some(p => inRing(x, y, p[0]) && !p.slice(1).some(h => inRing(x, y, h)));
const bbox = (ps: Poly[]) => { let a = [180, 90, -180, -90]; for (const p of ps) for (const [x, y] of p[0]) a = [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x), Math.max(a[3], y)]; return a; };
const fix = (s: string) => { try { return decodeURIComponent(escape(s)); } catch { return s; } };
const cod = (await Bun.file(codabPath).json()).features.map((f: any) => ({ pcode: f.properties.adm3_pcode, name: f.properties.adm3_name1 ?? f.properties.adm3_name, g: polys(f.geometry), b: bbox(polys(f.geometry)) }));
const gb = (await Bun.file(gbPath).json()).features;
const out: any[] = [];
for (const f of gb) {
  const g = polys(f.geometry), [x0, y0, x1, y1] = bbox(g); const votes: Record<string, number> = {}; let n = 0;
  for (let i = 0.5; i < 30; i++) for (let j = 0.5; j < 30; j++) {
    const x = x0 + ((x1 - x0) * i) / 30, y = y0 + ((y1 - y0) * j) / 30;
    if (!inGeom(x, y, g)) continue; n++;
    const hit = cod.find((c: any) => x >= c.b[0] && x <= c.b[2] && y >= c.b[1] && y <= c.b[3] && inGeom(x, y, c.g));
    if (hit) votes[hit.pcode] = (votes[hit.pcode] || 0) + 1;
  }
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  out.push({ shapeID: f.properties.shapeID, shapeName: fix(f.properties.shapeName), pcode: best?.[0] ?? null, codabName: cod.find((c: any) => c.pcode === best?.[0])?.name, share: best ? +(best[1] / n).toFixed(2) : 0, samples: n });
}
const weak = out.filter(o => o.share < 0.6);
const dup = Object.entries(out.reduce((m: any, o) => ((m[o.pcode] = [...(m[o.pcode] || []), o.shapeName]), m), {})).filter(([, v]) => (v as any[]).length > 1);
console.log({ shapes: out.length, distinctPcodes: new Set(out.map(o => o.pcode)).size, weakOverlap: weak.length, duplicates: dup.length });
weak.forEach(w => console.log("  weak", JSON.stringify(w))); dup.forEach(d => console.log("  dup", JSON.stringify(d)));
await Bun.write(outPath, JSON.stringify(out, null, 1));
