import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { cantons, findCantons, getCanton, getCantons } from "../src/cantons";
import { arrondissements, divisions, regions } from "../src/data/admin";
import { metadata } from "../src/data/metadata";
import {
  councilSummaries,
  getCouncilSummary,
  getPollingStations,
  pollingStations,
} from "../src/elecam";
import { normalizeName } from "../src/normalize";
import { sources } from "../src/sources";
import type { AdminUnit, SourceId } from "../src/types";
import {
  findVillages,
  getVillage,
  getVillages,
  villages,
} from "../src/villages";

const pkg = join(import.meta.dir, "..");
const units: readonly AdminUnit[] = [
  ...regions,
  ...divisions,
  ...arrondissements,
];
const unitByPcode = new Map(units.map((u) => [u.pcode, u]));

describe("counts", () => {
  test("10 regions, 58 divisions, 360 arrondissements", () => {
    expect(regions.length).toBe(10);
    expect(divisions.length).toBe(58);
    expect(arrondissements.length).toBe(360);
  });

  test("1,504 cantons and 17,070 villages", () => {
    expect(cantons.length).toBe(1504);
    expect(villages.length).toBe(17070);
  });

  test("30,353 polling stations, 95 abroad, and one council summary per arrondissement", () => {
    expect(pollingStations.length).toBe(30353);
    expect(getPollingStations(null).length).toBe(95);
    expect(councilSummaries.length).toBe(360);
  });

  test("ids and P-codes are unique", () => {
    expect(unitByPcode.size).toBe(units.length);
    expect(new Set(cantons.map((c) => c.id)).size).toBe(cantons.length);
    expect(new Set(villages.map((v) => v.id)).size).toBe(villages.length);
  });
});

describe("hierarchy", () => {
  test("every division and arrondissement has a parent one level up, and its P-code extends the parent's", () => {
    for (const d of divisions) {
      expect(unitByPcode.get(d.parentPcode)?.level).toBe("region");
      expect(d.regionPcode).toBe(d.parentPcode);
      expect(d.pcode).toMatch(new RegExp(`^${d.parentPcode}\\d{3}$`));
    }
    for (const a of arrondissements) {
      const parent = unitByPcode.get(a.parentPcode);
      expect(parent?.level).toBe("division");
      expect(a.divisionPcode).toBe(a.parentPcode);
      expect(a.regionPcode).toBe(parent?.parentPcode ?? "");
      expect(a.pcode).toMatch(new RegExp(`^${a.parentPcode}\\d{3}$`));
    }
  });

  test("every canton belongs to an arrondissement and every village to a canton of the same arrondissement", () => {
    for (const c of cantons) {
      expect(unitByPcode.get(c.arrondissementPcode)?.level).toBe(
        "arrondissement",
      );
      expect(c.id).toMatch(new RegExp(`^${c.arrondissementPcode}-C\\d{2}$`));
    }
    for (const v of villages) {
      const canton = getCanton(v.cantonId);
      expect(canton?.arrondissementPcode).toBe(v.arrondissementPcode);
      expect(v.id).toMatch(new RegExp(`^${v.cantonId}-V\\d{3}$`));
    }
  });

  test("every arrondissement has cantons, and every canton has villages", () => {
    for (const a of arrondissements)
      expect(getCantons(a.pcode).length).toBeGreaterThan(0);
    for (const c of cantons)
      expect(getVillages(c.id).length).toBeGreaterThan(0);
  });

  test("polling stations point to an arrondissement, or to none for the diaspora", () => {
    for (const s of pollingStations)
      if (s.arrondissementPcode !== null)
        expect(unitByPcode.get(s.arrondissementPcode)?.level).toBe(
          "arrondissement",
        );
    for (const a of arrondissements)
      expect(getCouncilSummary(a.pcode)?.arrondissementPcode).toBe(a.pcode);
  });

  test("scoped queries partition the data", () => {
    const sum = (n: number[]) => n.reduce((a, b) => a + b, 0);
    expect(sum(regions.map((r) => getVillages(r.pcode).length))).toBe(
      villages.length,
    );
    expect(sum(divisions.map((d) => getCantons(d.pcode).length))).toBe(
      cantons.length,
    );
    expect(
      sum(regions.map((r) => getPollingStations(r.pcode).length)) + 95,
    ).toBe(pollingStations.length);
    for (const v of getVillages("CM002007"))
      expect(v.arrondissementPcode.startsWith("CM002007")).toBe(true);
    expect(getVillages("not a code")).toEqual([]);
  });

  test("a child's bounding box lies inside its parent's, and contains its centroid", () => {
    for (const u of units) {
      const [minX, minY, maxX, maxY] = u.bbox;
      const [x, y] = u.centroid;
      expect(minX <= x && x <= maxX && minY <= y && y <= maxY).toBe(true);
      if (u.parentPcode === null) continue;
      const p = unitByPcode.get(u.parentPcode)?.bbox ?? [0, 0, 0, 0];
      expect(minX >= p[0] && minY >= p[1]).toBe(true);
      expect(maxX <= p[2] && maxY <= p[3]).toBe(true);
    }
  });
});

describe("provenance", () => {
  const known = new Set(Object.keys(sources));
  const listed = new Set(metadata.sources.map((s) => s.id));

  test("every record and alias cites sources that exist and are listed in metadata", () => {
    const check = (ids: readonly SourceId[]) => {
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        expect(known.has(id)).toBe(true);
        expect(listed.has(id)).toBe(true);
      }
    };
    for (const u of units) {
      check(u.sources);
      for (const a of u.aliases) {
        check(a.sources);
        for (const id of a.sources) expect(u.sources).toContain(id);
      }
    }
    for (const c of cantons) check(c.sources);
    for (const v of villages) check(v.sources);
    expect(listed.has("elecam-polling-stations-2025")).toBe(true);
  });

  test("OCHA's own spelling is kept as refName and as an alias", () => {
    for (const u of units) {
      expect(u.sources).toContain("ocha-cod-ab-cmr");
      expect(
        u.aliases.some(
          (a) => a.sources.includes("ocha-cod-ab-cmr") && a.lang !== "en",
        ),
      ).toBe(true);
    }
  });

  test("Wikidata ids are well formed and never shared between units", () => {
    const qids = units.flatMap((u) => (u.wikidata ? [u.wikidata] : []));
    for (const q of qids) expect(q).toMatch(/^Q\d+$/);
    expect(new Set(qids).size).toBe(qids.length);
    for (const u of units)
      if (u.wikidata) expect(u.sources).toContain("wikidata");
  });
});

describe("names (decision D8)", () => {
  test("Yaoundé I is found by its display name, with ordinal 1", () => {
    const y1 = arrondissements.find((a) => a.name.fr === "Yaoundé I");
    expect(y1?.pcode).toBe("CM002007001");
    expect(y1?.name.en).toBe("Yaoundé I");
    expect(y1?.ordinal).toBe(1);
    expect(y1?.refName).toBe("Yaounde 1er");
  });

  test("display names only restore accents and numbering: they fold to the OCHA name", () => {
    for (const u of units) {
      expect(normalizeName(u.name.fr)).toBe(normalizeName(u.refName));
      if (u.level !== "region")
        expect(normalizeName(u.name.en)).toBe(normalizeName(u.refName));
    }
  });

  test("numbered arrondissements use Roman numerals in both languages", () => {
    const numbered = arrondissements.filter((a) => a.ordinal !== undefined);
    expect(numbered.length).toBeGreaterThan(40);
    for (const a of arrondissements) {
      expect(a.name.fr).not.toMatch(/\d/);
      expect(a.name.en).not.toMatch(/\d/);
    }
    for (const a of numbered) {
      const roman = ["I", "II", "III", "IV", "V", "VI", "VII"][
        (a.ordinal ?? 0) - 1
      ];
      expect(a.name.fr.endsWith(` ${roman}`)).toBe(true);
      expect(a.name.en.endsWith(` ${roman}`)).toBe(true);
    }
  });

  test("canton and village labels only change letter case", () => {
    for (const r of [...cantons, ...villages]) {
      expect(r.label.toUpperCase()).toBe(r.name.toUpperCase());
      expect(r.label).not.toBe("");
    }
    expect(getVillage("CM001001001-C01-V001")?.label).toBe("Baya Hadjida");
  });

  test("name search folds case, accents and punctuation", () => {
    const [first] = findVillages("baya-hadjida");
    expect(first?.id).toBe("CM001001001-C01-V001");
    expect(findCantons("Ngaoundal ville", { within: "CM001" }).length).toBe(1);
    expect(findCantons("Ngaoundal ville", { within: "CM002" }).length).toBe(0);
  });
});

describe("immutability", () => {
  const deepFrozen = (value: unknown): boolean => {
    if (value === null || typeof value !== "object") return true;
    if (!Object.isFrozen(value)) return false;
    return Object.values(value).every(deepFrozen);
  };

  test("collections and records are deep-frozen", () => {
    for (const list of [
      regions,
      divisions,
      arrondissements,
      cantons,
      villages,
      pollingStations,
      councilSummaries,
      metadata.sources,
    ])
      expect(Object.isFrozen(list)).toBe(true);
    for (const u of units) expect(deepFrozen(u)).toBe(true);
    for (const c of cantons) expect(deepFrozen(c)).toBe(true);
    expect(villages.every(deepFrozen)).toBe(true);
    expect(pollingStations.every(Object.isFrozen)).toBe(true);
    expect(deepFrozen(metadata)).toBe(true);
  });

  test("query results are frozen", () => {
    expect(Object.isFrozen(getCantons("CM001"))).toBe(true);
    expect(Object.isFrozen(getVillages("CM001001001-C01"))).toBe(true);
    expect(Object.isFrozen(findVillages("baya hadjida"))).toBe(true);
    expect(Object.isFrozen(getPollingStations("CM001"))).toBe(true);
  });
});

describe("entry isolation", () => {
  // Static import graph from src/index.ts: the core entry must not reach the
  // canton, village or ELECAM data.
  const reachable = (entry: string): Set<string> => {
    const seen = new Set<string>();
    const visit = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      if (!file.endsWith(".ts")) return;
      const text = readFileSync(file, "utf8");
      for (const [, spec = ""] of text.matchAll(
        /(?:import|export)\s[^;]*?from\s+"(\.[^"]+)"/g,
      )) {
        const base = resolve(dirname(file), spec);
        const target = [base, `${base}.ts`, join(base, "index.ts")].find(
          (p) => existsSync(p) && statSync(p).isFile(),
        );
        if (target) visit(target);
      }
    };
    visit(entry);
    return seen;
  };

  test("the core entry does not import canton, village or ELECAM data", () => {
    const files = [...reachable(join(pkg, "src/index.ts"))].map((f) =>
      f.slice(pkg.length + 1),
    );
    expect(files).toContain("generated/admin.json");
    for (const heavy of [
      "generated/cantons.json",
      "generated/villages.json",
      "generated/elecam.json",
    ])
      expect(files).not.toContain(heavy);
  });
});
