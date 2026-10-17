// Cross-reference OCHA COD-AB CMR against the library data and geoBoundaries inputs.
const [codabDir, libDir, scriptDir] = process.argv.slice(2);
const load = async (p: string) => Bun.file(p).json();
const libArr = async (f: string) => Object.values(await import(`${libDir}/${f}.ts`)).find(Array.isArray) as any[];
const norm = (s: string) => s?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

for (const lvl of [1, 2, 3]) {
  const g = await load(`${codabDir}/cmr_admin${lvl}.geojson`);
  const props = g.features.map((f: any) => f.properties);
  if (lvl === 1) console.log("COD-AB property keys:", Object.keys(props[0]).join(", "), "\nsample:", JSON.stringify(props[0]).slice(0, 400));
  const lib = await libArr(lvl === 1 ? "regions" : lvl === 2 ? "divisions" : "subdivisions");
  const codab = new Map(props.map((p: any) => [p[`adm${lvl}_pcode`], p]));
  const libBy = new Map(lib.map((r: any) => [r.pcode, r]));
  const onlyLib = [...libBy.keys()].filter(k => !codab.has(k));
  const onlyCodab = [...codab.keys()].filter(k => !libBy.has(k));
  const nameDiff: string[] = [];
  for (const [k, r] of libBy as Map<string, any>) {
    const c: any = codab.get(k); if (!c) continue;
    const cn = c[`adm${lvl}_name1`] ?? c[`adm${lvl}_name`];
    if (norm(cn) !== norm(r.nameFr)) nameDiff.push(`${k}: lib="${r.nameFr}" codab="${cn}"`);
  }
  console.log(`\nADM${lvl}: codab=${codab.size} features=${props.length} lib=${libBy.size} | lib-only=${onlyLib.length} codab-only=${onlyCodab.length} | name mismatches (accent/case-insensitive)=${nameDiff.length}`);
  if (onlyLib.length) console.log("  lib-only:", onlyLib.slice(0, 10).join(" "));
  if (onlyCodab.length) console.log("  codab-only:", onlyCodab.slice(0, 10).join(" "));
  nameDiff.filter(s => !/ (I|II|III|IV|V|VI|VII)" codab=".* (1er|\d+e)"/.test(s)).forEach(s => console.log("  ", s));
  const gb = await load(`${scriptDir}/geoBoundaries-CMR-ADM${lvl}-enhanced.geojson`);
  const gbP = gb.features.map((f: any) => f.properties.pcode);
  console.log(`  geoBoundaries-enhanced pcodes in codab: ${gbP.filter((p: string) => codab.has(p)).length}/${gbP.length}`);
}
