// Build the canonical, source-attributed dataset in canonical/ from the data pool.
// Keys: OCHA COD-AB P-codes (ADM1-3); cantons and villages get stable derived ids under their arrondissement.
// Nothing is invented: every value carries the id of the source it came from; conflicts go to issues.json.
// Usage: bun tools/build-canonical.ts   (run from data-pool/)
import { matchKey } from "./names";

const P = {
  codab: "sources/ocha-cod-ab-cmr/extracted/geojson",
  bucrepParsed: "build/bucrep-parsed.json",
  bucrepLayout: "build/bucrep-layout.json",
  knownDiffs: "patches/known-extraction-differences.json",
  issueResolutions: "decisions/issue-resolutions.json",
  bucrepMatch: "build/bucrep-codab-match.json",
  elecamCsv: "sources/elecam-polling-stations-2025/raw/elecam_data.csv",
  elecamMatch: "build/elecam-codab-match.json",
  spatial: "build/geoboundaries-codab-spatial.json",
  popTable: "sources/location-script-reference-tables/raw/extracted-pop.txt",
  hasc: "sources/location-script-reference-tables/raw/hasc-code.csv",
  julyLib: "derived/location-script-2025-07/snapshot/cameroon_locations_complete.json",
  out: "canonical",
};
const json = (p: string) => Bun.file(p).json();
const SRC = { codab: "ocha-cod-ab-cmr", bucrep: "bucrep-rgph2005-repertoire-villages", elecam: "elecam-polling-stations-2025", gb: "geoboundaries-cmr-gbopen", ref: "location-script-reference-tables", july: "cameroon-locations-0.1.0-july-2025" };
const issues: any[] = [];
const alias = (list: any[], name: string | null | undefined, source: string, extra: object = {}) => {
  if (!name) return;
  const n = name.trim();
  if (!list.some(a => a.name === n && a.source === source)) list.push({ name: n, source, ...extra });
};

// --- COD-AB backbone -------------------------------------------------------
// bbox [minLon, minLat, maxLon, maxLat] of the polygon, rounded outward to 1e-6 so it always contains the shape.
const floor6 = (x: number) => Math.floor(x * 1e6) / 1e6, ceil6 = (x: number) => Math.ceil(x * 1e6) / 1e6;
const bboxOf = (g: any) => {
  const rings: number[][][] = g.type === "Polygon" ? g.coordinates : g.coordinates.flat();
  let [x0, y0, x1, y1] = [180, 90, -180, -90];
  for (const ring of rings) for (const [x, y] of ring) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return [floor6(x0), floor6(y0), ceil6(x1), ceil6(y1)];
};
const cod = async (n: number) => (await json(`${P.codab}/cmr_admin${n}.geojson`)).features.map((f: any) => ({ ...f.properties, bbox: bboxOf(f.geometry) }));
const [c1, c2, c3] = [await cod(1), await cod(2), await cod(3)];
const unit = (p: any, n: number) => {
  const en = p[`adm${n}_name`], fr = p[`adm${n}_name1`];
  const u: any = {
    pcode: p[`adm${n}_pcode`],
    parentPcode: n === 1 ? "CM" : p[`adm${n - 1}_pcode`],
    level: n,
    name: { fr: fr ?? en, ...(en && en !== fr ? { en } : {}) },
    refName: p[`adm${n}_ref_name1`] ?? null,
    areaSqKm: +p.area_sqkm.toFixed(3),
    centroid: [+p.center_lon.toFixed(6), +p.center_lat.toFixed(6)],
    bbox: p.bbox,
    aliases: [] as any[],
    sources: { [SRC.codab]: { version: p.version, validOn: String(p.valid_on).slice(0, 10) } },
  };
  alias(u.aliases, fr, SRC.codab, { lang: "fr" });
  alias(u.aliases, en, SRC.codab, { lang: "en" });
  alias(u.aliases, p[`adm${n}_ref_name1`], SRC.codab, { kind: "ascii-reference" });
  return u;
};
const adm = [null, new Map(c1.map((p: any) => [p.adm1_pcode, unit(p, 1)])), new Map(c2.map((p: any) => [p.adm2_pcode, unit(p, 2)])), new Map(c3.map((p: any) => [p.adm3_pcode, unit(p, 3)]))] as Map<string, any>[];

// --- BUCREP: arrondissement population, cantons, villages -----------------
const parsed = await json(P.bucrepParsed), layout = (await json(P.bucrepLayout)).rows, bmatch: any[] = await json(P.bucrepMatch);
const byHeaderLine = new Map(bmatch.map(m => [m.line, m]));
// Layout rows are in the same order as parsed records (verified by tools/compare-extractions.ts): use them for PDF page numbers.
// Pair records with layout rows in PDF order (text line order), independent of any decision moves.
const allLines: number[] = parsed.regions.flatMap((r: any) => r.divisions.flatMap((d: any) => d.arrondissements.flatMap((a: any) => [a.total.source.line, ...a.cantons.flatMap((c: any) => [c.source.line, ...c.villages.map((v: any) => v.source.line)])]))).sort((a: number, b: number) => a - b);
if (allLines.length !== layout.length) throw new Error(`layout alignment broken: ${allLines.length} vs ${layout.length}`);
const pageOfLine = new Map(allLines.map((l, i) => [l, layout[i].docPage]));
let li = 0;
const pageAt = (line: number) => (li++, pageOfLine.get(line));
const pop = (r: any) => ({ total: r.pop.total, male: r.pop.male, female: r.pop.female });
const cantons: any[] = [], villages: any[] = [];
const pad = (n: number, w: number) => String(n).padStart(w, "0");
for (const r of parsed.regions) {
  alias(adm[1].get(byHeaderLine.get(r.headerLine).pcode).aliases, r.header, SRC.bucrep);
  for (const d of r.divisions) {
    alias(adm[2].get(byHeaderLine.get(d.headerLine).pcode).aliases, d.header, SRC.bucrep);
    for (const a of d.arrondissements) {
      const m = byHeaderLine.get(a.headerLine), u = adm[3].get(m.pcode);
      alias(u.aliases, a.header, SRC.bucrep);
      if (m.how === "manual" && /PARENT CONFLICT/.test(m.reason)) issues.push({ kind: "parent-conflict", pcode: u.pcode, name: u.name.fr, detail: m.reason, bucrepDivision: d.header, sources: [SRC.bucrep, SRC.codab, SRC.elecam] });
      const tp = pageAt(a.total.source.line);
      u.population2005 = { ...pop(a.total), source: SRC.bucrep, docPage: tp, textLine: a.total.source.line };
      alias(u.aliases, a.total.name, SRC.bucrep, { kind: "total-row" });
      a.cantons.forEach((c: any, ci: number) => {
        const id = `${u.pcode}-C${pad(ci + 1, 2)}`;
        cantons.push({ id, adm3Pcode: u.pcode, name: c.name, population2005: pop(c), source: { id: SRC.bucrep, docPage: pageAt(c.source.line), textLine: c.source.line, ...(c.source.patches ? { patched: c.source.patches } : {}) } });
        c.villages.forEach((v: any, vi: number) => {
          villages.push({ id: `${id}-V${pad(vi + 1, 3)}`, cantonId: id, adm3Pcode: u.pcode, name: v.name, population2005: pop(v), source: { id: SRC.bucrep, docPage: pageAt(v.source.line), textLine: v.source.line, ...(v.source.lastLine ? { textLineEnd: v.source.lastLine } : {}), ...(v.source.patches ? { patched: v.source.patches } : {}), ...(v.source.decision ? { decision: v.source.decision } : {}) } });
        });
      });
    }
  }
}
if (li !== layout.length) throw new Error(`layout alignment broken: ${li} vs ${layout.length}`);
for (const c of parsed.checks) issues.push({ kind: `printed-total-inconsistency:${c.kind}`, ...c, note: "Present in the BUCREP PDF itself (both independent extractions agree); values kept as printed.", source: SRC.bucrep });
for (const s of parsed.sexMismatch) issues.push({ kind: "printed-sex-sum-inconsistency", ...s, note: "total ≠ male + female as printed in the PDF; kept as printed.", source: SRC.bucrep });
// Rows whose typography (weight, shading, offset) contradicts their level; the level was confirmed against printed totals.
for (const d of (await json(P.knownDiffs)).differences) {
  if (d.status !== "confirmed") throw new Error(`known extraction difference at line ${d.line} is not confirmed (status: ${d.status})`);
  const c = cantons.find(c => c.source.textLine === d.line);
  if (!c) throw new Error(`known extraction difference at line ${d.line} is not a canton record`);
  issues.push({ kind: "printed-typography-inconsistency", cantonId: c.id, adm3Pcode: c.adm3Pcode, name: c.name, docPage: d.docPage, textLine: d.line, levelInText: d.text, levelFromTypography: d.pdf, detail: d.evidence.typography, totals: d.evidence.totals, note: "Level taken from the text indentation and confirmed by the printed totals; the irregular typography is kept as printed. See patches/known-extraction-differences.json.", source: SRC.bucrep });
}

// --- BUCREP region/division table (pages 7-8) -----------------------------
const popLines = (await Bun.file(P.popTable).text()).split("\n").map(l => l.match(/^( *)(.+?) +(\d+) +(\d+) +(\d+) *$/)).filter(Boolean) as RegExpMatchArray[];
let curReg: any;
for (const m of popLines) {
  const ind = m[1].length, name = m[2].trim(), val = { total: +m[3], male: +m[4], female: +m[5] };
  if (ind === 0) continue; // CAMEROUN
  const pool = ind === 4 ? [...adm[1].values()] : [...adm[2].values()].filter(u => u.parentPcode === curReg?.pcode);
  const hit = pool.filter(u => u.aliases.some((a: any) => matchKey(a.name) === matchKey(name)));
  if (hit.length !== 1) { issues.push({ kind: "unmatched-population-table-row", name, level: ind === 4 ? 1 : 2 }); continue; }
  if (ind === 4) curReg = hit[0];
  hit[0].population2005 = { ...val, source: SRC.bucrep, docPage: ind === 4 ? 7 : undefined, table: "Répartition de la population résidente par département selon le sexe (pp. 7-8)" };
  alias(hit[0].aliases, name, SRC.bucrep, { kind: "population-table" });
}
for (const n of [1, 2]) for (const u of adm[n].values()) {
  if (!u.population2005) { issues.push({ kind: "missing-population", pcode: u.pcode, name: u.name.fr }); continue; }
  const kids = [...adm[n + 1].values()].filter(k => k.parentPcode === u.pcode), s = kids.reduce((t, k) => t + (k.population2005?.total ?? 0), 0);
  if (s !== u.population2005.total) issues.push({ kind: "population-table≠Σchildren", pcode: u.pcode, name: u.name.fr, table: u.population2005.total, sumOfChildren: s, diff: s - u.population2005.total, note: n === 2 && ["CM002009", "CM002010"].includes(u.pcode) ? "Explained by Akoeman (BUCREP counts it in Nyong-et-Mfoumou)" : undefined });
}

// --- ELECAM ---------------------------------------------------------------
const em: any[] = await json(P.elecamMatch);
const emKey = new Map(em.map(e => [`${e.region}|${e.division}|${e.council}`, e]));
const [, ...rows] = (await Bun.file(P.elecamCsv).text()).replace(/^﻿/, "").trim().split(/\r?\n/).map(l => l.split(","));
const stations = rows.map(([region, division, council, centre, station, total]) => {
  const e = emKey.get(`${region}|${division}|${council}`);
  return { adm3Pcode: e.adm3, region, division, council, centre, station, registeredVoters: +total };
});
for (const e of em) {
  if (e.adm3) alias(adm[3].get(e.adm3).aliases, e.council, SRC.elecam, { kind: "council" });
  if (e.adm2) alias(adm[2].get(e.adm2).aliases, e.division, SRC.elecam);
  if (e.adm1) alias(adm[1].get(e.adm1).aliases, e.region, SRC.elecam);
}
for (const u of adm[3].values()) {
  const s = stations.filter(x => x.adm3Pcode === u.pcode);
  u.elecam2025 = { council: s[0]?.council ?? null, registeredVoters: s.reduce((t, x) => t + x.registeredVoters, 0), pollingCentres: new Set(s.map(x => x.centre)).size, pollingStations: s.length, source: SRC.elecam };
}

// --- HASC (divisions only, from statoids-style table) ---------------------
for (const line of (await Bun.file(P.hasc).text()).trim().split("\n").filter(l => l.split(",")[0].trim())) {
  const [name, hasc] = line.split(",");
  const hit = [...adm[2].values()].filter(u => u.aliases.some((a: any) => matchKey(a.name) === matchKey(name)));
  if (hit.length === 1) { hit[0].hasc = { code: hasc, source: SRC.ref }; alias(hit[0].aliases, name, SRC.ref, { kind: "hasc-table" }); }
  else issues.push({ kind: "unmatched-hasc-row", name, hasc, candidates: hit.length });
}
for (const r of adm[1].values()) {
  const codes = new Set([...adm[2].values()].filter(d => d.parentPcode === r.pcode && d.hasc).map(d => d.hasc.code.split(".").slice(0, 2).join(".")));
  if (codes.size === 1) r.hasc = { code: [...codes][0], source: SRC.ref, derived: "common prefix of its divisions' HASC codes" };
}

// --- geoBoundaries (spatially matched) and July 2025 library names ----------
const fix = (s: string) => { try { return decodeURIComponent(escape(s)); } catch { return s; } };
for (const g of await json(P.spatial)) { const u = adm[3].get(g.pcode); u.geoBoundariesShapeId = g.shapeID; alias(u.aliases, fix(g.shapeName), SRC.gb, { matchedBy: `spatial overlap ${g.share}` }); }
const july = await json(P.julyLib);
for (const [lvl, key] of [[1, "regions"], [2, "divisions"], [3, "subdivisions"]] as const)
  for (const r of july[key]) { const u = adm[lvl].get(r.pcode); if (!u) continue; alias(u.aliases, r.nameFr, SRC.july); alias(u.aliases, r.nameEn, SRC.july, { lang: "en" }); alias(u.aliases, r.councilNameFr, SRC.july, { kind: "council" }); }

// --- Name-variant report (non-numbering spelling differences vs COD-AB) ---
for (const u of adm[3].values()) {
  const keys = new Set(u.aliases.filter((a: any) => a.kind !== "council").map((a: any) => matchKey(a.name)));
  if (keys.size > 1) issues.push({ kind: "name-variants", pcode: u.pcode, codab: u.name.fr, variants: [...new Map(u.aliases.filter((a: any) => a.kind !== "council").map((a: any) => [matchKey(a.name), `${a.name} (${a.source})`])).values()] });
}

// --- Research (research/, GPT-6-Astra run 2026-10-17, every claim URL-cited) ---
const R = "research";
const RES = "research-2026-10-17";
if (await Bun.file(`${R}/wikidata-pcodes.json`).exists()) {
  const all = new Map([...adm[1], ...adm[2], ...adm[3]]);
  for (const w of await json(`${R}/wikidata-pcodes.json`)) {
    if (!w.qid) continue;
    // Regions/departments are typed matches; ADM3 links are usually commune/town items, so they stay candidates.
    const key = w.entityScope === "region" || w.entityScope === "department" || w.entityScope === "arrondissement" ? "wikidata" : "wikidataCandidate";
    all.get(w.pcode)[key] = { qid: w.qid, label: w.label, entityScope: w.entityScope, confidence: w.confidence, matchMethod: w.matchMethod, source: RES };
  }
  for (const h of await json(`${R}/arrondissement-history.json`)) {
    const u = adm[3].get(h.pcode);
    (u.history ??= []).push({ date: h.eventDate, decree: h.decree, event: h.eventType, nameInSource: h.nameInSource, chefLieu: h.chefLieuInSource, predecessor: h.predecessor, evidence: h.evidence.map((e: any) => ({ url: e.url, page: e.page, quote: e.quote })), confidence: h.confidence, source: RES });
    if (h.chefLieuInSource) u.chefLieu ??= { name: h.chefLieuInSource, source: RES, decree: h.decree };
  }
  for (const n of await json(`${R}/official-names.json`)) {
    const u = adm[3].get(n.pcode) ?? adm[2].get(n.pcode);
    u.officialName = { recommended: n.recommendedOfficialName, confidence: n.confidence, legalStatus: n.legalStatus, action: n.recommendedAction, evidence: n.evidence.map((e: any) => ({ url: e.url, page: e.page, quote: e.quote })), source: RES };
    alias(u.aliases, n.recommendedOfficialName, RES, { kind: "official-name-recommendation" });
  }
  for (const v of await json(`${R}/elecam-crosswalk-verification.json`))
    issues.push({ kind: "crosswalk-verified", key: v.key, pcode: v.pcode, verdict: v.verdict, confidence: v.confidence, evidence: v.evidence.map((e: any) => e.url), source: RES });
  issues.push({ kind: "open-question", pcode: "CM003003006", name: "Ndelele", detail: "BUCREP lists a village KENTZOU II under Ndélélé (also in the 2023 Ndélélé forest-management plan), while Kentzou (chef-lieu of Bombé, decree 2010/198) is in CM003003002. Exact location of Kentzou II unknown.", source: RES });
}

// --- Issues closed by DECISIONS.md (decisions/issue-resolutions.json) ------
for (const r of (await json(P.issueResolutions)).resolutions) {
  const hit = issues.filter(i => Object.entries(r.match).every(([k, v]) => i[k] === v));
  if (!hit.length) throw new Error(`issue resolution ${r.decision} matches no issue: ${JSON.stringify(r.match)}`);
  for (const i of hit) Object.assign(i, { status: r.status, decision: r.decision, resolution: r.resolution, evidence: r.evidence });
}

// --- Write ----------------------------------------------------------------
const sorted = (m: Map<string, any>) => [...m.values()].sort((a, b) => a.pcode.localeCompare(b.pcode));
const w = (f: string, d: any) => Bun.write(`${P.out}/${f}`, JSON.stringify(d, null, 1) + "\n");
await w("adm1-regions.json", sorted(adm[1]));
await w("adm2-divisions.json", sorted(adm[2]));
await w("adm3-arrondissements.json", sorted(adm[3]));
await w("cantons.json", cantons);
await w("villages.json", villages);
await w("elecam-polling-stations.json", stations);
await w("issues.json", issues);
const countByKind = (xs: any[]) => xs.reduce((m: any, i) => ((m[i.kind] = (m[i.kind] || 0) + 1), m), {});
const summary = {
  adm1: adm[1].size, adm2: adm[2].size, adm3: adm[3].size, cantons: cantons.length, villages: villages.length, pollingStations: stations.length,
  diasporaStations: stations.filter(s => !s.adm3Pcode).length,
  pop2005: { national: 17463836, Σadm1Table: sorted(adm[1]).reduce((t, u) => t + u.population2005.total, 0), Σadm3: sorted(adm[3]).reduce((t, u) => t + u.population2005.total, 0), Σvillages: villages.reduce((t, v) => t + (v.population2005.total ?? 0), 0) },
  issues: countByKind(issues.filter(i => i.status !== "resolved")),
  resolvedIssues: countByKind(issues.filter(i => i.status === "resolved")),
};
await w("summary.json", summary);
console.log(JSON.stringify(summary, null, 1));
