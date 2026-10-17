// Propose P-codes for ELECAM councils that did not match by name, using evidence:
//  (a) a BUCREP village/canton of the same (normalised) name inside one arrondissement of the matched division;
//  (b) the arrondissement left over in that division once all other ELECAM councils are matched.
import { matchKey } from "./names";
const [elecamMatch, bucrepParsed, bucrepMatch, codabDir] = process.argv.slice(2);
const em: any[] = await Bun.file(elecamMatch).json();
const parsed = await Bun.file(bucrepParsed).json(), bm: any[] = await Bun.file(bucrepMatch).json();
const a3 = (await Bun.file(`${codabDir}/cmr_admin3.geojson`).json()).features.map((f: any) => f.properties);
const byLine = new Map(bm.filter(x => x.level === 3).map(x => [x.line, x.pcode]));
const places: { key: string; name: string; adm3: string; kind: string; line: number }[] = [];
for (const r of parsed.regions) for (const d of r.divisions) for (const a of d.arrondissements) {
  const p = byLine.get(a.headerLine);
  for (const c of a.cantons) { places.push({ key: matchKey(c.name), name: c.name, adm3: p, kind: "canton", line: c.source.line }); for (const v of c.villages) places.push({ key: matchKey(v.name), name: v.name, adm3: p, kind: "village", line: v.source.line }); }
}
const taken = new Set(em.filter(e => e.adm3).map(e => e.adm3));
for (const e of em.filter(e => !e.adm3 && e.adm2)) {
  const k = matchKey(e.council);
  const hits = places.filter(p => p.adm3?.startsWith(e.adm2) && (p.key === k || p.key.startsWith(k)));
  const arrs = [...new Set(hits.map(h => h.adm3))];
  const left = a3.filter((p: any) => p.adm2_pcode === e.adm2 && !taken.has(p.adm3_pcode)).map((p: any) => `${p.adm3_pcode} ${p.adm3_name1 ?? p.adm3_name}`);
  console.log(`${e.division} / ${e.council}: BUCREP→ ${arrs.map(a => `${a} ${a3.find((p: any) => p.adm3_pcode === a)?.adm3_name1 ?? a3.find((p: any) => p.adm3_pcode === a)?.adm3_name} [${hits.filter(h => h.adm3 === a).slice(0, 2).map(h => `${h.kind} ${h.name} l.${h.line}`).join("; ")}]`).join(" || ") || "none"}  | unclaimed in division: ${left.join(", ")}`);
}
