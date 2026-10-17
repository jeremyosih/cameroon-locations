// Row-by-row comparison of the text parse (parse-bucrep.ts) and the PDF layout extraction.
const [parsedPath, layoutPath] = process.argv.slice(2);
const parsed = await Bun.file(parsedPath).json(), layout = await Bun.file(layoutPath).json();
const t: any[] = [];
for (const r of parsed.regions) for (const d of r.divisions) for (const a of d.arrondissements) {
  if (a.total) t.push({ ...a.total, level: "arr", arr: a.header });
  for (const c of a.cantons) { t.push({ ...c, level: "canton", arr: a.header }); for (const v of c.villages) t.push({ ...v, level: "village", arr: a.header }); }
}
t.sort((a, b) => a.source.line - b.source.line); // PDF order (decisions may have moved records)
const L = layout.rows;
const levelOf = (r: any) => (r.bold ? (r.x < 103 ? "arr" : "canton") : "village");
const norm = (s: string) => s.replace(/\s+/g, "").toUpperCase();
console.log("text rows", t.length, "layout rows", L.length);
const diffs = { level: [] as string[], name: [] as string[], pop: [] as string[] };
for (let i = 0; i < Math.min(t.length, L.length); i++) {
  const a = t[i], b = L[i];
  if (a.pop.total !== b.total || a.pop.male !== b.male || a.pop.female !== b.female) diffs.pop.push(`#${i} line ${a.source.line} ${a.name} ${JSON.stringify(a.pop)} vs p${b.docPage} ${b.name} ${b.total}/${b.male}/${b.female}`);
  if (norm(a.nameAsPrinted) !== norm(b.name)) diffs.name.push(`#${i} line ${a.source.line} "${a.nameAsPrinted}" vs "${b.name}" (p${b.docPage})`);
  if (a.level !== levelOf(b)) diffs.level.push(`#${i} line ${a.source.line} [${a.arr}] ${a.name}: text=${a.level}(indent ${a.source.indent}) pdf=${levelOf(b)}(x=${b.x},bold=${b.bold}) p${b.docPage}`);
}
for (const [k, v] of Object.entries(diffs)) { console.log(`\n${k} differences: ${v.length}`); v.slice(0, 40).forEach(s => console.log("  " + s)); }
