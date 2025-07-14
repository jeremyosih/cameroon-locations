import {
  getRegions,
  region,
  getDivisions,
  getDivisionByCode,
  getSubdivisions,
  getSubdivisionByCode,
  getCantons,
  getCantonByCode,
  getLocalAreas,
  getLocalAreaByCode,
  getBlocks,
  getBlockByCode,
  getDivisionsInRegion,
  getSubdivisionsInDivision,
  getCantonsInSubdivision,
  getLocalAreasInCanton,
  getBlocksInLocalArea,
  getCantonsByType,
  getCityCantons,
  getTraditionalCantons,
  getLocalAreasWithPopulation,
  getRegionOfDivision,
  getDivisionOfSubdivision,
  getSubdivisionOfCanton,
  getCantonOfLocalArea,
  getLocalAreaOfBlock,
  search,
  searchByType,
  NotFoundError,
  CameroonLocations,
  division,
  subdivision,
  canton,
  localArea,
  block,
} from "../CameroonLocations";
import { expect, it, describe } from "vitest";

describe("CameroonLocations v2.0 - 6-Level Hierarchy", () => {
  describe("getRegions", () => {
    it("should return all regions", () => {
      const regions = getRegions();
      expect(regions).toBeDefined();
      expect(regions.length).toBe(10);
      expect(regions[0]).toHaveProperty("code");
      expect(regions[0]).toHaveProperty("nameFr");
      expect(regions[0]).toHaveProperty("nameEn");
      expect(regions[0]).toHaveProperty("name");
    });
  });

  describe("region", () => {
    it("should return a region wrapper by name", () => {
      const centre = region("Centre");
      expect(centre).toBeDefined();
      expect(centre?.name).toBe("Centre");
      expect(centre?.code).toBe("02");
      expect(centre?.data.name).toBe("Centre");
    });

    it("should return a region wrapper by code", () => {
      const centre = region("02");
      expect(centre).toBeDefined();
      expect(centre?.code).toBe("02");
      expect(centre?.name).toBe("Centre");
    });

    it("should return undefined for non-existent region", () => {
      const nonExistent = region("NonExistent");
      expect(nonExistent).toBeUndefined();
    });

    it("should provide chainable API for divisions", () => {
      const centre = region("Centre");
      expect(centre).toBeDefined();
      const divisions = centre?.divisions();
      expect(divisions).toBeDefined();
      expect(divisions?.length).toBeGreaterThan(0);
      expect(divisions?.[0].name).toBeDefined();
      expect(divisions?.[0].data.region).toBe("Centre");
    });

    it("should allow finding specific division", () => {
      const centre = region("Centre");
      expect(centre).toBeDefined();
      const mfoundi = centre?.division("Mfoundi");
      expect(mfoundi).toBeDefined();
      expect(mfoundi?.name).toBe("Mfoundi");
    });

    it("should provide access to cantons", () => {
      const centre = region("Centre");
      expect(centre).toBeDefined();
      const cantons = centre?.cantons();
      expect(cantons).toBeDefined();
      expect(cantons?.length).toBeGreaterThan(0);
    });
  });

  describe("getDivisions", () => {
    it("should return all divisions", () => {
      const divisions = getDivisions();
      expect(divisions).toBeDefined();
      expect(divisions.length).toBeGreaterThan(0);
      expect(divisions[0]).toHaveProperty("code");
      expect(divisions[0]).toHaveProperty("nameFr");
      expect(divisions[0]).toHaveProperty("nameEn");
      expect(divisions[0]).toHaveProperty("region");
    });
  });

  describe("getDivisionByCode", () => {
    it("should return a division by code", () => {
      const mfoundi = getDivisionByCode("0207");
      expect(mfoundi).toBeDefined();
      expect(mfoundi?.code).toBe("0207");
      expect(mfoundi?.name).toBe("Mfoundi");
    });

    it("should return undefined for non-existent division", () => {
      const nonExistent = getDivisionByCode("XX99");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("division wrapper", () => {
    it("should provide chainable API for region", () => {
      const mfoundi = division("Mfoundi");
      expect(mfoundi).toBeDefined();
      const region = mfoundi?.region();
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
    });

    it("should allow finding specific subdivision", () => {
      const mfoundi = division("Mfoundi");
      expect(mfoundi).toBeDefined();
      const yaounde1 = mfoundi?.subdivision("Yaoundé I");
      expect(yaounde1).toBeDefined();
      expect(yaounde1?.name).toBe("Yaoundé I");
    });

    it("should provide access to cantons", () => {
      const mfoundi = division("Mfoundi");
      expect(mfoundi).toBeDefined();
      const cantons = mfoundi?.cantons();
      expect(cantons).toBeDefined();
      expect(cantons?.length).toBeGreaterThan(0);
    });
  });

  describe("getSubdivisions", () => {
    it("should return all subdivisions", () => {
      const subdivisions = getSubdivisions();
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBeGreaterThan(0);
      expect(subdivisions[0]).toHaveProperty("code");
      expect(subdivisions[0]).toHaveProperty("nameFr");
      expect(subdivisions[0]).toHaveProperty("nameEn");
      expect(subdivisions[0]).toHaveProperty("division");
    });
  });

  describe("getSubdivisionByCode", () => {
    it("should return a subdivision by code", () => {
      const yaounde1 = getSubdivisionByCode("020701");
      expect(yaounde1).toBeDefined();
      expect(yaounde1?.code).toBe("020701");
      expect(yaounde1?.name).toBe("Yaoundé I");
    });
  });

  describe("subdivision wrapper", () => {
    it("should provide chainable API for division and region", () => {
      const yaounde1 = subdivision("Yaoundé I");
      expect(yaounde1).toBeDefined();

      const division = yaounde1?.division();
      expect(division).toBeDefined();
      expect(division?.name).toBe("Mfoundi");

      const region = yaounde1?.region();
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
    });

    it("should allow finding specific canton", () => {
      const yaounde1 = subdivision("Yaoundé I");
      expect(yaounde1).toBeDefined();
      const canton = yaounde1?.canton("Yaoundé I");
      expect(canton).toBeDefined();
      expect(canton?.name).toBe("Yaoundé I");
    });

    it("should provide access to cantons", () => {
      const yaounde1 = subdivision("Yaoundé I");
      expect(yaounde1).toBeDefined();
      const cantons = yaounde1?.cantons();
      expect(cantons).toBeDefined();
      expect(cantons?.length).toBeGreaterThan(0);
    });
  });

  describe("getCantons", () => {
    it("should return all cantons", () => {
      const cantons = getCantons();
      expect(cantons).toBeDefined();
      expect(cantons.length).toBeGreaterThan(0);
      expect(cantons[0]).toHaveProperty("code");
      expect(cantons[0]).toHaveProperty("nameFr");
      expect(cantons[0]).toHaveProperty("nameEn");
      expect(cantons[0]).toHaveProperty("type");
      expect(cantons[0]).toHaveProperty("subdivision");
    });
  });

  describe("getCantonByCode", () => {
    it("should return a canton by code", () => {
      const yaounde1Canton = getCantonByCode("020701");
      expect(yaounde1Canton).toBeDefined();
      expect(yaounde1Canton?.code).toBe("020701");
      expect(yaounde1Canton?.name).toBe("Yaoundé I");
      expect(yaounde1Canton?.type).toBe("city");
    });
  });

  describe("canton wrapper", () => {
    it("should provide chainable API for subdivision, division and region", () => {
      const yaounde1Canton = canton("Yaoundé I");
      expect(yaounde1Canton).toBeDefined();

      const subdivision = yaounde1Canton?.subdivision();
      expect(subdivision).toBeDefined();
      expect(subdivision?.name).toBe("Yaoundé I");

      const division = yaounde1Canton?.division();
      expect(division).toBeDefined();
      expect(division?.name).toBe("Mfoundi");

      const region = yaounde1Canton?.region();
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
    });

    it("should allow finding specific local area", () => {
      const yaounde1Canton = canton("Yaoundé I");
      expect(yaounde1Canton).toBeDefined();
      const centreAdmin = yaounde1Canton?.localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();
      expect(centreAdmin?.name).toBe("Centre Administratif");
    });

    it("should provide access to local areas", () => {
      const yaounde1Canton = canton("Yaoundé I");
      expect(yaounde1Canton).toBeDefined();
      const localAreas = yaounde1Canton?.localAreas();
      expect(localAreas).toBeDefined();
      expect(localAreas?.length).toBeGreaterThan(0);
    });
  });

  describe("getLocalAreas", () => {
    it("should return all local areas", () => {
      const localAreas = getLocalAreas();
      expect(localAreas).toBeDefined();
      expect(localAreas.length).toBeGreaterThan(0);
      expect(localAreas[0]).toHaveProperty("code");
      expect(localAreas[0]).toHaveProperty("nameFr");
      expect(localAreas[0]).toHaveProperty("nameEn");
      expect(localAreas[0]).toHaveProperty("type");
      expect(localAreas[0]).toHaveProperty("canton");
    });
  });

  describe("getLocalAreaByCode", () => {
    it("should return a local area by code", () => {
      const centreAdmin = getLocalAreaByCode("02070101");
      expect(centreAdmin).toBeDefined();
      expect(centreAdmin?.code).toBe("02070101");
      expect(centreAdmin?.name).toBe("Centre Administratif");
      expect(centreAdmin?.type).toBe("neighborhood");
    });
  });

  describe("localArea wrapper", () => {
    it("should provide chainable API for canton, subdivision, division and region", () => {
      const centreAdmin = localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();

      const canton = centreAdmin?.canton();
      expect(canton).toBeDefined();
      expect(canton?.name).toBe("Yaoundé I");

      const subdivision = centreAdmin?.subdivision();
      expect(subdivision).toBeDefined();
      expect(subdivision?.name).toBe("Yaoundé I");

      const division = centreAdmin?.division();
      expect(division).toBeDefined();
      expect(division?.name).toBe("Mfoundi");

      const region = centreAdmin?.region();
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
    });

    it("should provide population data when available", () => {
      const centreAdmin = localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();
      expect(centreAdmin?.population).toBeDefined();
      expect(centreAdmin?.population?.total).toBeGreaterThan(0);
      expect(centreAdmin?.population?.male).toBeGreaterThan(0);
      expect(centreAdmin?.population?.female).toBeGreaterThan(0);
    });

    it("should allow finding specific block", () => {
      const centreAdmin = localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();
      const blocA = centreAdmin?.block("Bloc A");
      expect(blocA).toBeDefined();
      expect(blocA?.name).toBe("Bloc A");
    });

    it("should provide access to blocks", () => {
      const centreAdmin = localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();
      const blocks = centreAdmin?.blocks();
      expect(blocks).toBeDefined();
      expect(blocks?.length).toBeGreaterThan(0);
    });
  });

  describe("getBlocks", () => {
    it("should return all blocks", () => {
      const blocks = getBlocks();
      expect(blocks).toBeDefined();
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0]).toHaveProperty("code");
      expect(blocks[0]).toHaveProperty("nameFr");
      expect(blocks[0]).toHaveProperty("nameEn");
      expect(blocks[0]).toHaveProperty("localArea");
    });
  });

  describe("getBlockByCode", () => {
    it("should return a block by code", () => {
      const blocA = getBlockByCode("0207010101");
      expect(blocA).toBeDefined();
      expect(blocA?.code).toBe("0207010101");
      expect(blocA?.name).toBe("Bloc A");
    });
  });

  describe("block wrapper", () => {
    it("should provide chainable API for localArea, canton, subdivision, division and region", () => {
      const blocA = block("Bloc A");
      expect(blocA).toBeDefined();

      const localArea = blocA?.localArea();
      expect(localArea).toBeDefined();
      expect(localArea?.name).toBe("Centre Administratif");

      const canton = blocA?.canton();
      expect(canton).toBeDefined();
      expect(canton?.name).toBe("Yaoundé I");

      const subdivision = blocA?.subdivision();
      expect(subdivision).toBeDefined();
      expect(subdivision?.name).toBe("Yaoundé I");

      const division = blocA?.division();
      expect(division).toBeDefined();
      expect(division?.name).toBe("Mfoundi");

      const region = blocA?.region();
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
    });
  });

  describe("hierarchical queries", () => {
    it("should return divisions in Centre region", () => {
      const divisions = getDivisionsInRegion("Centre");
      expect(divisions).toBeDefined();
      expect(divisions.length).toBe(10);
      expect(divisions.every((d) => d.region === "Centre")).toBe(true);
    });

    it("should return subdivisions in Mfoundi division", () => {
      const subdivisions = getSubdivisionsInDivision("Mfoundi");
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBe(7);
      expect(subdivisions.every((s) => s.division === "Mfoundi")).toBe(true);
    });

    it("should return cantons in Yaoundé I subdivision", () => {
      const cantons = getCantonsInSubdivision("Yaoundé I");
      expect(cantons).toBeDefined();
      expect(cantons.length).toBe(1);
      expect(cantons.every((c) => c.subdivision === "Yaoundé I")).toBe(true);
    });

    it("should return local areas in Yaoundé I canton", () => {
      const localAreas = getLocalAreasInCanton("Yaoundé I");
      expect(localAreas).toBeDefined();
      expect(localAreas.length).toBe(3);
      expect(localAreas.every((la) => la.canton === "Yaoundé I")).toBe(true);
    });

    it("should return blocks in Centre Administratif local area", () => {
      const blocks = getBlocksInLocalArea("Centre Administratif");
      expect(blocks).toBeDefined();
      expect(blocks.length).toBe(3);
      expect(blocks.every((b) => b.localArea === "Centre Administratif")).toBe(
        true
      );
    });
  });

  describe("canton type filtering", () => {
    it("should return city cantons", () => {
      const cityCantons = getCityCantons();
      expect(cityCantons).toBeDefined();
      expect(cityCantons.length).toBeGreaterThan(0);
      expect(cityCantons.every((c) => c.type === "city")).toBe(true);
    });

    it("should return cantons by specific type", () => {
      const lamidats = getCantonsByType("lamidat");
      expect(lamidats).toBeDefined();
      expect(lamidats.every((c) => c.type === "lamidat")).toBe(true);
    });

    it("should return traditional cantons", () => {
      const traditional = getTraditionalCantons();
      expect(traditional).toBeDefined();
      expect(
        traditional.every(
          (c) =>
            c.type === "lamidat" ||
            c.type === "sultanate" ||
            c.type === "chiefdom"
        )
      ).toBe(true);
    });
  });

  describe("population data", () => {
    it("should return local areas with population data", () => {
      const withPopulation = getLocalAreasWithPopulation();
      expect(withPopulation).toBeDefined();
      expect(withPopulation.length).toBeGreaterThan(0);
      expect(withPopulation.every((la) => la.population !== undefined)).toBe(
        true
      );
    });
  });

  describe("relationship functions", () => {
    it("should get region of division", () => {
      const region = getRegionOfDivision("Mfoundi");
      expect(region).toBeDefined();
      expect(region?.name).toBe("Centre");
      expect(region?.code).toBe("02");
    });

    it("should get division of subdivision", () => {
      const division = getDivisionOfSubdivision("Yaoundé I");
      expect(division).toBeDefined();
      expect(division?.name).toBe("Mfoundi");
      expect(division?.code).toBe("0207");
    });

    it("should get subdivision of canton", () => {
      const subdivision = getSubdivisionOfCanton("Yaoundé I");
      expect(subdivision).toBeDefined();
      expect(subdivision?.name).toBe("Yaoundé I");
      expect(subdivision?.code).toBe("020701");
    });

    it("should get canton of local area", () => {
      const canton = getCantonOfLocalArea("Centre Administratif");
      expect(canton).toBeDefined();
      expect(canton?.name).toBe("Yaoundé I");
      expect(canton?.code).toBe("020701");
    });

    it("should get local area of block", () => {
      const localArea = getLocalAreaOfBlock("Bloc A");
      expect(localArea).toBeDefined();
      expect(localArea?.name).toBe("Centre Administratif");
      expect(localArea?.code).toBe("02070101");
    });

    it("should return undefined for non-existent relationships", () => {
      expect(getRegionOfDivision("NonExistent")).toBeUndefined();
      expect(getDivisionOfSubdivision("NonExistent")).toBeUndefined();
      expect(getSubdivisionOfCanton("NonExistent")).toBeUndefined();
      expect(getCantonOfLocalArea("NonExistent")).toBeUndefined();
      expect(getLocalAreaOfBlock("NonExistent")).toBeUndefined();
    });
  });

  describe("search", () => {
    it("should search across all 6 administrative levels", () => {
      const results = search("Yaoundé");
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some(
          (r) =>
            r.item.nameFr.includes("Yaoundé") ||
            r.item.nameEn.includes("Yaoundé")
        )
      ).toBe(true);
    });

    it("should limit search results", () => {
      const results = search("a", { limit: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it("should filter by types", () => {
      const results = search("Centre", { types: ["region"] });
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "region")).toBe(true);
    });

    it("should search cantons specifically", () => {
      const results = search("Yaoundé", { types: ["canton"] });
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "canton")).toBe(true);
    });

    it("should return empty array for short queries", () => {
      const results = search("a");
      expect(results).toEqual([]);
    });
  });

  describe("searchByType", () => {
    it("should search only regions", () => {
      const results = searchByType("Centre", "region");
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "region")).toBe(true);
    });

    it("should search only cantons", () => {
      const results = searchByType("Yaoundé", "canton");
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "canton")).toBe(true);
    });

    it("should search only local areas", () => {
      const results = searchByType("Centre", "localArea");
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "localArea")).toBe(true);
    });

    it("should search only blocks", () => {
      const results = searchByType("Bloc", "block");
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "block")).toBe(true);
    });
  });

  describe("CameroonLocations static class", () => {
    it("should provide all methods as static", () => {
      expect(typeof CameroonLocations.getRegions).toBe("function");
      expect(typeof CameroonLocations.getDivisions).toBe("function");
      expect(typeof CameroonLocations.getCantons).toBe("function");
      expect(typeof CameroonLocations.getLocalAreas).toBe("function");
      expect(typeof CameroonLocations.getBlocks).toBe("function");
      expect(typeof CameroonLocations.search).toBe("function");

      const regions = CameroonLocations.getRegions();
      expect(regions.length).toBe(10);
    });
  });

  describe("error handling", () => {
    it("should throw NotFoundError for invalid wrapper operations", () => {
      const centre = region("Centre");
      expect(() => centre?.division("NonExistent")).toThrow(NotFoundError);
    });

    it("should have proper error classes", () => {
      expect(NotFoundError).toBeDefined();
      expect(new NotFoundError("test")).toBeInstanceOf(Error);
    });
  });

  describe("bilingual support", () => {
    it("should support French and English names", () => {
      const adamawa = region("Adamaoua"); // French
      const adamawa2 = region("Adamawa"); // English

      expect(adamawa).toBeDefined();
      expect(adamawa2).toBeDefined();
      expect(adamawa?.code).toBe(adamawa2?.code);
      expect(adamawa?.nameFr).toBe("Adamaoua");
      expect(adamawa?.nameEn).toBe("Adamawa");
    });

    it("should provide language-specific name access", () => {
      const adamawa = region("Adamaoua");
      expect(adamawa?.getName("fr")).toBe("Adamaoua");
      expect(adamawa?.getName("en")).toBe("Adamawa");
      expect(adamawa?.getName()).toBe("Adamaoua"); // defaults to French
    });
  });

  describe("6-level hierarchy navigation", () => {
    it("should navigate from region to block", () => {
      const centre = region("Centre");
      expect(centre).toBeDefined();

      const mfoundi = centre?.division("Mfoundi");
      expect(mfoundi).toBeDefined();

      const yaounde1Sub = mfoundi?.subdivision("Yaoundé I");
      expect(yaounde1Sub).toBeDefined();

      const yaounde1Canton = yaounde1Sub?.canton("Yaoundé I");
      expect(yaounde1Canton).toBeDefined();

      const centreAdmin = yaounde1Canton?.localArea("Centre Administratif");
      expect(centreAdmin).toBeDefined();

      const blocA = centreAdmin?.block("Bloc A");
      expect(blocA).toBeDefined();
      expect(blocA?.name).toBe("Bloc A");
    });

    it("should navigate from block to region", () => {
      const blocA = block("Bloc A");
      expect(blocA).toBeDefined();

      const localArea = blocA?.localArea();
      expect(localArea?.name).toBe("Centre Administratif");

      const canton = blocA?.canton();
      expect(canton?.name).toBe("Yaoundé I");

      const subdivision = blocA?.subdivision();
      expect(subdivision?.name).toBe("Yaoundé I");

      const division = blocA?.division();
      expect(division?.name).toBe("Mfoundi");

      const region = blocA?.region();
      expect(region?.name).toBe("Centre");
    });
  });
});
