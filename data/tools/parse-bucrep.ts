// Parse the BUCREP 2005 "Répertoire actualisé des villages" text into a strict hierarchy.
// Input: loc.txt, the unedited pdf-parse output of loc.pdf (see sources/bucrep-rgph2005-repertoire-villages).
// Corrections are never made in the text: they live in a patches file, keyed by loc.txt line number,
// each with a reason and evidence. Every record keeps its source line so it can be traced to the PDF.
// Usage: bun tools/parse-bucrep.ts <loc.txt> <patches.json> <out.json> [decisions.json]
// decisions.json holds judgement calls (not extraction fixes), e.g. moving a village to another canton; see DECISIONS.md.

type Pop = { total: number | null; male: number | null; female: number | null };
type Level = "arr" | "canton" | "village";
type Patch = { line: number; setLevel?: Level; setName?: string; reason: string; evidence?: string };
type Rec = { name: string; nameAsPrinted: string; pop: Pop; source: { line: number; lastLine?: number; indent: number; patches?: string[] } };
type Canton = Rec & { villages: Rec[] };
type Arr = { header: string; headerLine: number; total?: Rec; cantons: Canton[]; orphanVillages: Rec[] };
type Div = { header: string; headerLine: number; arrondissements: Arr[] };
type Reg = { header: string; headerLine: number; divisions: Div[] };

const [inPath, patchPath, outPath, decisionPath] = process.argv.slice(2);
const raw = (await Bun.file(inPath).text()).split("\n");
const patches: Patch[] = (await Bun.file(patchPath).json()).patches;
const patchAt = new Map(patches.map(p => [p.line, p]));
const usedPatches = new Set<number>();

const num = (s: string) => (s === "-" ? null : Number(s));
const rowRe = /^( *)(.+?) +(-|\d+) +(-|\d+) +(-|\d+) *$/;
// Tolerates the misspellings that occur in the PDF: ARRONDISEMENT, ARRONDISSMENT, ARRONDISSEMENTDE, "7.1 DEPARTEMENT".
const headerRe = /^(\d+)\.(\d+)?\.?(\d+)?\.? *(REGION|DEPARTEMENT|ARRONDIS+E?MENT) ?(.*?) *$/;
// Running page furniture repeated by pdf-parse on every page.
const junkRe = /^(BUCREP, 3|ème|RGPH 2005 – Répertoire actualisé des villages du Cameroun|Page \d+|Quartiers \/ Villages|Sexe|Total Masculin Féminin)$/;

// 1. Drop page furniture; re-join records whose numbers were wrapped onto following line(s).
const lines: { line: number; lastLine?: number; text: string }[] = [];
const isJunk = (s: string) => !s.trim() || junkRe.test(s.trim());
for (let i = 0; i < raw.length; i++) {
  if (isJunk(raw[i])) continue;
  const start = i + 1;
  let text = raw[i].replace(/\s+$/, "");
  while (!rowRe.test(text) && !headerRe.test(text.trim())) {
    let j = i + 1;
    while (j < raw.length && isJunk(raw[j])) j++;
    if (j >= raw.length || !/^[\d\s-]+$/.test(raw[j].trim())) break;
    text = `${text} ${raw[j].trim()}`;
    i = j;
  }
  lines.push({ line: start, ...(i + 1 !== start ? { lastLine: i + 1 } : {}), text });
}

// 2. Classify by indentation: 12 = arrondissement total row, 13-17 = canton, everything else = village
//    (18-20, plus indent-0 rows, which pdf-parse emits for some blocks of villages).
const levelOf = (indent: number): Level => (indent === 12 ? "arr" : indent >= 13 && indent <= 17 ? "canton" : "village");
const tidy = (s: string) => s.replace(/\s+/g, " ").trim();

const regions: Reg[] = []; const unparsed: { line: number; text: string }[] = [];
let reg: Reg | undefined, div: Div | undefined, arr: Arr | undefined, canton: Canton | undefined;

for (const { line, lastLine, text } of lines) {
  const h = text.trim().match(headerRe);
  if (h) {
    const name = tidy(h[5].replace(/^(DE L[’']|DU |DE LA |DES |D[’']|DE )/, ""));
    if (h[4] === "REGION") regions.push((reg = { header: name, headerLine: line, divisions: [] }));
    else if (h[4] === "DEPARTEMENT") reg!.divisions.push((div = { header: name, headerLine: line, arrondissements: [] }));
    else div!.arrondissements.push((arr = { header: name, headerLine: line, cantons: [], orphanVillages: [] }));
    canton = undefined;
    continue;
  }
  const m = text.match(rowRe);
  if (!m) { unparsed.push({ line, text }); continue; }
  const p = patchAt.get(line);
  if (p) usedPatches.add(line);
  const rec: Rec = {
    name: p?.setName ?? tidy(m[2]),
    nameAsPrinted: tidy(m[2]),
    pop: { total: num(m[3]), male: num(m[4]), female: num(m[5]) },
    source: { line, ...(lastLine ? { lastLine } : {}), indent: m[1].length, ...(p ? { patches: [p.reason] } : {}) },
  };
  const lvl = p?.setLevel ?? levelOf(m[1].length);
  if (lvl === "arr") { arr!.total = rec; canton = undefined; }
  else if (lvl === "canton") arr!.cantons.push((canton = { ...rec, villages: [] }));
  else if (canton) canton.villages.push(rec);
  else arr!.orphanVillages.push(rec);
}

// 2b. Judgement calls: move a village to the canton printed at another line. The printed placement is kept.
const decisions: { id: string; villageLine: number; toCantonLine: number; reason: string }[] = decisionPath ? (await Bun.file(decisionPath).json()).moves : [];
for (const d of decisions) {
  const arrs = regions.flatMap(r => r.divisions.flatMap(dv => dv.arrondissements));
  const from = arrs.flatMap(a => a.cantons).find(c => c.villages.some(v => v.source.line === d.villageLine));
  const to = arrs.flatMap(a => a.cantons).find(c => c.source.line === d.toCantonLine);
  if (!from || !to) throw new Error(`decision ${d.id}: line not found`);
  const v = from.villages.splice(from.villages.findIndex(v => v.source.line === d.villageLine), 1)[0];
  (v.source as any).decision = { id: d.id, printedUnderCanton: from.name, reason: d.reason };
  to.villages.unshift(v);
}

// 3. Arithmetic checks against the printed totals.
const sum = (xs: { pop: Pop }[]) => xs.reduce((s, x) => s + (x.pop.total ?? 0), 0);
const checks: any[] = [];
const allArr = regions.flatMap(r => r.divisions.flatMap(d => d.arrondissements));
for (const a of allArr) {
  if (!a.total) checks.push({ kind: "arrondissement-without-total-row", arr: a.header, line: a.headerLine });
  else if (sum(a.cantons) !== a.total.pop.total) checks.push({ kind: "arr-total≠Σcantons", arr: a.header, line: a.total.source.line, printed: a.total.pop.total, sum: sum(a.cantons), diff: sum(a.cantons) - (a.total.pop.total ?? 0) });
  if (a.orphanVillages.length) checks.push({ kind: "villages-before-first-canton", arr: a.header, count: a.orphanVillages.length, line: a.orphanVillages[0].source.line });
  for (const c of a.cantons) {
    if (!c.villages.length) checks.push({ kind: "canton-without-villages", arr: a.header, canton: c.name, line: c.source.line, total: c.pop.total });
    else if (sum(c.villages) !== c.pop.total) checks.push({ kind: "canton-total≠Σvillages", arr: a.header, canton: c.name, line: c.source.line, printed: c.pop.total, sum: sum(c.villages), diff: sum(c.villages) - (c.pop.total ?? 0) });
  }
}
const allRecs = allArr.flatMap(a => [...(a.total ? [a.total] : []), ...a.cantons, ...a.cantons.flatMap(c => c.villages), ...a.orphanVillages]);
const sexMismatch = allRecs.filter(x => x.pop.total !== null && x.pop.male !== null && x.pop.female !== null && x.pop.total !== x.pop.male + x.pop.female).map(x => ({ name: x.name, line: x.source.line, ...x.pop }));
const unusedPatches = patches.filter(p => !usedPatches.has(p.line));

const villages = allArr.flatMap(a => a.cantons.flatMap(c => c.villages));
const summary = {
  regions: regions.length, divisions: regions.reduce((s, r) => s + r.divisions.length, 0), arrondissements: allArr.length,
  cantons: allArr.reduce((s, a) => s + a.cantons.length, 0), villages: villages.length,
  popΣarrondissementRows: allArr.reduce((s, a) => s + (a.total?.pop.total ?? 0), 0), popΣvillages: sum(villages), officialNationalTotal: 17463836,
  joinedWrappedRecords: lines.filter(l => l.lastLine).length, patchesApplied: usedPatches.size, unusedPatches: unusedPatches.length,
  unparsedLines: unparsed.length, checkFailures: checks.length, sexSumMismatches: sexMismatch.length,
};
console.log(summary);
console.log(checks.reduce((m: any, c) => ((m[c.kind] = (m[c.kind] || 0) + 1), m), {}));
if (unusedPatches.length) console.log("UNUSED PATCHES", unusedPatches);
await Bun.write(outPath, JSON.stringify({ source: "bucrep-rgph2005-repertoire-villages", input: inPath.split("/").at(-1), summary, checks, sexMismatch, unparsed, regions }, null, 1));
