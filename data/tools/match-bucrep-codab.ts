// Match BUCREP region/division/arrondissement headers to COD-AB P-codes, hierarchically (child within matched parent).
// Manual decisions come from crosswalks/bucrep-codab.json (keyed by BUCREP header text + parent P-code), each with a reason.
import { matchKey } from "./names";
const [parsedPath, codabDir, crosswalkPath, outPath] = process.argv.slice(2);
const parsed = await Bun.file(parsedPath).json();
const cw: Record<string, { pcode: string; reason: string }> = (await Bun.file(crosswalkPath).exists()) ? (await Bun.file(crosswalkPath).json()).manual : {};
const feats = async (n: number) => (await Bun.file(`${codabDir}/cmr_admin${n}.geojson`).json()).features.map((f: any) => f.properties);
const [a1, a2, a3] = [await feats(1), await feats(2), await feats(3)];
const names = (p: any, n: number) => [p[`adm${n}_name`], p[`adm${n}_name1`], p[`adm${n}_ref_name1`]].filter(Boolean);
const out: any[] = [], unmatched: any[] = [], usedManual = new Set<string>();

const pick = (header: string, cands: any[], n: number, parentPcode: string) => {
  const key = `${n}|${parentPcode}|${header}`;
  if (cw[key]) { usedManual.add(key); return { pcode: cw[key].pcode, how: "manual", reason: cw[key].reason }; }
  const k = matchKey(header);
  const hits = cands.filter(p => names(p, n).some((x: string) => matchKey(x) === k));
  if (hits.length === 1) return { pcode: hits[0][`adm${n}_pcode`], how: "exact-normalised" };
  unmatched.push({ key, header, level: n, candidates: cands.map(p => `${p[`adm${n}_pcode`]} ${names(p, n).join(" / ")}`) });
  return null;
};

for (const r of parsed.regions) {
  const rm = pick(r.header, a1, 1, "CM");
  out.push({ level: 1, header: r.header, line: r.headerLine, ...rm });
  for (const d of r.divisions) {
    const dm = rm && pick(d.header, a2.filter((p: any) => p.adm1_pcode === rm.pcode), 2, rm.pcode);
    out.push({ level: 2, header: d.header, line: d.headerLine, parent: rm?.pcode, ...dm });
    for (const a of d.arrondissements) {
      const am = dm && pick(a.header, a3.filter((p: any) => p.adm2_pcode === dm.pcode), 3, dm.pcode);
      out.push({ level: 3, header: a.header, line: a.headerLine, parent: dm?.pcode, ...am });
    }
  }
}
const dup = Object.entries(out.filter(o => o.pcode).reduce((m: any, o) => ((m[o.pcode] = (m[o.pcode] || 0) + 1), m), {})).filter(([, c]) => (c as number) > 1);
console.log({ matched: out.filter(o => o.pcode).length, unmatched: unmatched.length, manual: usedManual.size, duplicatePcodes: dup });
unmatched.forEach(u => console.log(JSON.stringify(u)));
await Bun.write(outPath, JSON.stringify(out, null, 1));
