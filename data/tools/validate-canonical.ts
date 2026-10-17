// Structural validation of canonical/: referential integrity, uniqueness, required provenance.
const r = async (f: string) => Bun.file(`canonical/${f}`).json();
const [a1, a2, a3, ca, vi, st] = await Promise.all(["adm1-regions", "adm2-divisions", "adm3-arrondissements", "cantons", "villages", "elecam-polling-stations"].map(f => r(`${f}.json`)));
const errs: string[] = []; const ok = (c: boolean, m: string) => c || errs.push(m);
const ids = (xs: any[], k: string) => new Set(xs.map(x => x[k]));
for (const [xs, k, n] of [[a1, "pcode", 10], [a2, "pcode", 58], [a3, "pcode", 360], [ca, "id", 0], [vi, "id", 0]] as const) ok(ids(xs, k).size === xs.length && (!n || xs.length === n), `unique ${k} / count`);
const p1 = ids(a1, "pcode"), p2 = ids(a2, "pcode"), p3 = ids(a3, "pcode"), pc = ids(ca, "id");
a2.forEach((x: any) => ok(p1.has(x.parentPcode), `adm2 parent ${x.pcode}`));
a3.forEach((x: any) => ok(p2.has(x.parentPcode), `adm3 parent ${x.pcode}`));
[...a1, ...a2, ...a3].forEach((x: any) => { ok(!!x.population2005?.source, `pop source ${x.pcode}`); ok(x.aliases.length > 0, `aliases ${x.pcode}`); ok(x.centroid?.length === 2 && x.areaSqKm > 0, `geo ${x.pcode}`); });
a3.forEach((x: any) => ok(x.elecam2025?.pollingStations > 0, `elecam ${x.pcode}`));
ca.forEach((c: any) => { ok(p3.has(c.adm3Pcode), `canton parent ${c.id}`); ok(c.source?.docPage > 0, `canton page ${c.id}`); });
vi.forEach((v: any) => { ok(pc.has(v.cantonId) && v.cantonId.startsWith(v.adm3Pcode), `village parent ${v.id}`); ok(v.source?.docPage > 0, `village page ${v.id}`); });
st.forEach((s: any) => ok(s.adm3Pcode === null ? s.region === "CMR A L'ETRANGER" : p3.has(s.adm3Pcode), `station ${s.council}`));
st.forEach((s: any) => ok(Number.isInteger(s.registeredVoters) && s.registeredVoters > 0, `station voters ${s.council}/${s.centre}/${s.station}`));
a3.forEach((x: any) => ok(x.elecam2025.registeredVoters === st.filter((s: any) => s.adm3Pcode === x.pcode).reduce((t: number, s: any) => t + s.registeredVoters, 0), `elecam voters Σ ${x.pcode}`));
const cantonsPerArr = new Set(ca.map((c: any) => c.adm3Pcode)).size;
console.log({ errors: errs.length, arrondissementsWithCantons: cantonsPerArr, sample: errs.slice(0, 5) });
process.exit(errs.length ? 1 : 0);
