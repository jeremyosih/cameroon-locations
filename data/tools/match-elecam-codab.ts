// Match ELECAM (region, division, council) to COD-AB P-codes hierarchically. Diaspora councils are kept, with pcode null.
import { parseCsvStrict } from "./csv";
import { matchKey } from "./names";
const [csvPath, codabDir, crosswalkPath, outPath] = process.argv.slice(2);
const [head, ...rows] = parseCsvStrict(await Bun.file(csvPath).text(), csvPath);
const cw: Record<string, { pcode: string | null; reason: string }> = (await Bun.file(crosswalkPath).exists()) ? (await Bun.file(crosswalkPath).json()).manual : {};
const feats = async (n: number) => (await Bun.file(`${codabDir}/cmr_admin${n}.geojson`).json()).features.map((f: any) => f.properties);
const A = [null, await feats(1), await feats(2), await feats(3)] as any[];
const names = (p: any, n: number) => [p[`adm${n}_name`], p[`adm${n}_name1`], p[`adm${n}_ref_name1`]].filter(Boolean);
const unmatched = new Map<string, any>(); const used = new Set<string>();
const pick = (name: string, n: number, parent: string | null) => {
  const key = `${n}|${parent}|${name}`;
  if (key in cw) { used.add(key); return cw[key].pcode; }
  if (n > 1 && !parent) return null;
  const cands = A[n].filter((p: any) => n === 1 || p[`adm${n - 1}_pcode`] === parent);
  const hits = cands.filter((p: any) => names(p, n).some((x: string) => matchKey(x) === matchKey(name)));
  if (hits.length === 1) return hits[0][`adm${n}_pcode`];
  unmatched.set(key, { key, candidates: cands.map((p: any) => `${p[`adm${n}_pcode`]} ${p[`adm${n}_name1`] ?? p[`adm${n}_name`]}`).join(" | ") });
  return null;
};
const councils = new Map<string, any>();
for (const r of rows) {
  const [region, division, council] = r;
  const k = `${region}|${division}|${council}`;
  if (councils.has(k)) continue;
  const p1 = pick(region, 1, null), p2 = pick(division, 2, p1), p3 = pick(council, 3, p2);
  councils.set(k, { region, division, council, adm1: p1, adm2: p2, adm3: p3 });
}
const vals = [...councils.values()];
const dup = Object.entries(vals.filter(v => v.adm3).reduce((m: any, v) => ((m[v.adm3] = [...(m[v.adm3] || []), v.council]), m), {})).filter(([, v]) => (v as any[]).length > 1);
console.log({ columns: head.join(","), stations: rows.length, councils: vals.length, matchedAdm3: vals.filter(v => v.adm3).length, unmatched: unmatched.size, manualUsed: used.size, duplicateAdm3: dup });
for (const u of unmatched.values()) console.log(JSON.stringify(u).slice(0, 400));
await Bun.write(outPath, JSON.stringify(vals, null, 1));
