import { expect, test } from "bun:test";
import { createSearch, search } from "../src/search";

const pcodes = (q: string, options?: Parameters<typeof search>[1]) =>
  search(q, options).map((r) => r.item.pcode);

test('"yaounde" ranks Yaoundé I to VII first, in order', () => {
  expect(pcodes("yaounde").slice(0, 7)).toEqual(
    [1, 2, 3, 4, 5, 6, 7].map((n) => `CM00200700${n}`),
  );
  expect(pcodes("Yaoundé 1er")[0]).toBe("CM002007001");
});

test("typos still find the place", () => {
  for (const [typo, prefix] of [
    ["Ngaoundre", "CM001005"],
    ["bafousam", "CM008"],
    ["yaonde", "CM002007"],
    ["extrme nord", "CM004"],
  ] as const) {
    expect(pcodes(typo)[0]).toStartWith(prefix);
  }
  expect(search("Ngaoundre")[0]?.item.name.fr).toContain("Ngaound");
});

test("exact beats prefix beats word prefix beats fuzzy", () => {
  const results = search("nord", { limit: 50 });
  const score = (pcode: string) =>
    results.find((r) => r.item.pcode === pcode)?.score ?? 0;
  expect(results[0]?.item.pcode).toBe("CM006");
  expect(results[0]?.score).toBe(1);
  expect(score("CM007")).toBeGreaterThan(score("CM004")); // Nord-Ouest > Extrême-Nord
  const fuzzy = search("nrod", { levels: ["region"] })[0];
  expect(fuzzy?.item.pcode).toBe("CM006");
  expect(fuzzy?.score).toBeLessThan(score("CM004"));
  for (const r of results) {
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThanOrEqual(1);
  }
  const scores = results.map((r) => r.score);
  expect(scores).toEqual(scores.toSorted((a, b) => b - a));
});

test("matches English names and aliases, reporting what matched", () => {
  const [farNorth] = search("far north");
  expect(farNorth?.item.pcode).toBe("CM004");
  expect(farNorth?.score).toBe(1);
  expect(farNorth?.matched).toBe(farNorth?.item.name.en as string);
});

test("one result per unit, with levels, within and limit", () => {
  const douala = pcodes("douala", { limit: 50 });
  expect(new Set(douala).size).toBe(douala.length);
  expect(pcodes("yaounde", { within: "CM002007", limit: 3 })).toEqual([
    "CM002007001",
    "CM002007002",
    "CM002007003",
  ]);
  expect(pcodes("yaounde", { within: "CM001" })).not.toContain("CM002007001");
  const regionsOnly = search("nord", { levels: ["region"], limit: 50 });
  expect(regionsOnly.every((r) => r.item.level === "region")).toBe(true);
  expect(pcodes("nord", { levels: [] })).toEqual(pcodes("nord"));
  expect(search("a", { limit: 100 }).length).toBeLessThanOrEqual(100);
  expect(search("a")).toHaveLength(10);
});

test("blank queries return nothing; results are frozen", () => {
  expect(search("")).toEqual([]);
  expect(search("  - ")).toEqual([]);
  const results = search("centre");
  expect(Object.isFrozen(results)).toBe(true);
  expect(Object.isFrozen(results[0])).toBe(true);
});

test("createSearch: same engine over arbitrary records", () => {
  const villages = [
    { id: "v1", names: ["MVOG-ADA", "Mvog Ada"] },
    { id: "v2", names: ["Mvog-Mbi"] },
    { id: "v3", names: ["Nkolbisson"] },
    { id: "v4", names: ["Mvog-Atangana Mballa"] },
  ];
  const find = createSearch(villages, (v) => v.names);
  const ids = (q: string, limit?: number) =>
    find(q, limit === undefined ? undefined : { limit }).map((r) => r.item.id);

  expect(ids("mvog ada")[0]).toBe("v1");
  expect(find("mvog ada")[0]?.score).toBe(1);
  // Prefixes: shorter names first, equal scores by name.
  expect(ids("mvog")).toEqual(["v1", "v2", "v4"]);
  expect(ids("mvog", 1)).toEqual(["v1"]);
  expect(ids("nkolbison")).toEqual(["v3"]);
  expect(ids("mballa")).toEqual(["v4"]);
  expect(ids("zzz")).toEqual([]);
});
