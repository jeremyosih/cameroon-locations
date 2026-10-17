import { describe, expect, test } from "bun:test";
import { arrondissements, divisions, regions } from "../src/data/admin";
import {
  type AdminUnit,
  find,
  getAncestors,
  getArrondissement,
  getArrondissements,
  getChildren,
  getDivision,
  getDivisions,
  getParent,
  getRegion,
  getUnit,
  isPcode,
} from "../src/index";

const units: readonly AdminUnit[] = [
  ...regions,
  ...divisions,
  ...arrondissements,
];
const namesOf = (u: AdminUnit) => [
  u.name.fr,
  u.name.en,
  u.refName,
  ...u.aliases.map((a) => a.name),
];

describe("lookups by code, name and alias", () => {
  test("French, English, P-code and HASC all resolve to the same region", () => {
    const farNorth = getUnit("CM004");
    expect(farNorth?.level).toBe("region");
    for (const q of [
      "extreme nord",
      "Extrême-Nord",
      "Far North",
      "FAR-NORTH",
      "CM004",
      "cm004",
      "CM.EN",
      " cm.en ",
    ]) {
      expect(getRegion(q)).toBe(farNorth as never);
    }
  });

  test("ordinal styles resolve to the same arrondissement", () => {
    const yaounde1 = getArrondissement("Yaoundé I");
    expect(yaounde1?.pcode).toBe("CM002007001");
    expect(yaounde1?.ordinal).toBe(1);
    for (const q of ["Yaounde 1er", "YAOUNDE I", "yaoundé-1", "CM002007001"]) {
      expect(getArrondissement(q)).toBe(yaounde1 as never);
    }
  });

  test("getX only matches its own level, and `within` scopes by P-code", () => {
    expect(getRegion("Mfoundi")).toBeUndefined();
    expect(getDivision("Mfoundi")?.pcode).toBe("CM002007");
    expect(getDivision("CM002007001")).toBeUndefined();
    expect(getArrondissement("Yaoundé I", { within: "CM002" })).toBeDefined();
    expect(
      getArrondissement("Yaoundé I", { within: "CM002007" }),
    ).toBeDefined();
    expect(getArrondissement("Yaoundé I", { within: "CM001" })).toBeUndefined();
    expect(find("Mfoundi", { within: "CM002007" })).toEqual([]);
    expect(getRegion("nowhere")).toBeUndefined();
    expect(find("nowhere")).toEqual([]);
  });

  test("every name and alias in the dataset finds its unit", () => {
    for (const unit of units) {
      expect(getUnit(unit.pcode)).toBe(unit);
      for (const name of namesOf(unit)) expect(find(name)).toContain(unit);
    }
  });

  test("`within` must be a P-code: names and partial codes match nothing", () => {
    expect(find("Yaoundé I", { within: " cm002 " })).toHaveLength(1);
    expect(getArrondissement("Yaoundé I", { within: undefined })).toBeDefined();
    for (const within of ["CM00", "CM0020", "Centre", "CM", ""]) {
      expect(find("Yaoundé I", { within })).toEqual([]);
      expect(getArrondissement("Yaoundé I", { within })).toBeUndefined();
    }
  });
});

describe("hierarchy", () => {
  test("parents and ancestors run from the region down", () => {
    expect(getAncestors("CM002007001").map((u) => u.pcode)).toEqual([
      "CM002",
      "CM002007",
    ]);
    expect(getParent("CM002007001")?.pcode).toBe("CM002007");
    expect(getParent("CM002")).toBeUndefined();
    expect(getAncestors("CM002")).toEqual([]);
    expect(getAncestors("CM999")).toEqual([]);
  });

  test("children partition the tree", () => {
    expect(getChildren("CM")).toEqual(regions);
    expect(
      regions.flatMap((r) => getChildren(r.pcode)).map((u) => u.pcode),
    ).toEqual(divisions.map((d) => d.pcode));
    expect(getChildren("CM002007").map((u) => u.pcode)).toEqual(
      getArrondissements("Mfoundi").map((u) => u.pcode),
    );
    expect(getChildren("CM002007001")).toEqual([]);
  });

  test("getDivisions and getArrondissements accept any query", () => {
    expect(getDivisions()).toEqual(divisions);
    expect(getArrondissements()).toEqual(arrondissements);
    const farNorth = getDivisions("Far North");
    expect(farNorth.length).toBeGreaterThan(0);
    expect(getDivisions("CM.EN")).toEqual(farNorth);
    expect(farNorth.every((d) => d.regionPcode === "CM004")).toBe(true);

    const centre = getArrondissements("Centre");
    expect(centre).toEqual(
      arrondissements.filter((a) => a.regionPcode === "CM002"),
    );
    expect(getArrondissements("Mfoundi").map((a) => a.ordinal)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getArrondissements("Yaoundé I")).toEqual([]);
    expect(getDivisions("nowhere")).toEqual([]);
  });
});

test("returned arrays are frozen, so callers cannot corrupt the index", () => {
  const results = [
    find("Centre"),
    getChildren("CM"),
    getChildren("CM002"),
    getAncestors("CM002007001"),
    getDivisions(),
    getDivisions("Centre"),
    getArrondissements("Centre"),
    getArrondissements("Mfoundi"),
  ];
  for (const array of results) {
    expect(Object.isFrozen(array)).toBe(true);
    expect(() => (array as unknown[]).splice(0)).toThrow(TypeError);
  }
  expect(getRegion("Centre")?.pcode).toBe("CM002");
  expect(getChildren("CM")).toHaveLength(10);
});

test("isPcode validates the format of every level", () => {
  for (const ok of ["CM004", "CM002007", "CM002007001"]) {
    expect(isPcode(ok)).toBe(true);
  }
  for (const bad of ["CM", "CM04", "CM0040", "cm004", "CM.EN", " CM004"]) {
    expect(isPcode(bad)).toBe(false);
  }
});
