import {
  getRegions,
  region,
  getDivisions,
  getDivisionByCode,
  getSubdivisions,
  getSubdivisionByCode,
  getDistricts,
  getDistrictByCode,
  getDivisionsInRegion,
  getSubdivisionsInDivision,
  getDistrictsInSubdivision,
  getRegionOfDivision,
  getDivisionOfSubdivision,
  getSubdivisionOfDistrict,
  search,
  searchByType,
  NotFoundError,
  CameroonLocations,
  division,
  subdivision,
  district,
} from "../CameroonLocations";
import { expect, it, describe } from "vitest";

describe("CameroonLocations", () => {
  describe("getRegions", () => {
    it("should return all regions", () => {
      const regions = getRegions();
      expect(regions).toBeDefined();
      expect(regions.length).toBe(10);
      expect(regions[0]).toHaveProperty("code");
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
  });

  describe("getDivisions", () => {
    it("should return all divisions", () => {
      const divisions = getDivisions();
      expect(divisions).toBeDefined();
      expect(divisions.length).toBeGreaterThan(0);
      expect(divisions[0]).toHaveProperty("code");
      expect(divisions[0]).toHaveProperty("name");
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
  });

  describe("getSubdivisions", () => {
    it("should return all subdivisions", () => {
      const subdivisions = getSubdivisions();
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBeGreaterThan(0);
      expect(subdivisions[0]).toHaveProperty("code");
      expect(subdivisions[0]).toHaveProperty("name");
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

    it("should allow finding specific district", () => {
      const yaounde1 = subdivision("Yaoundé I");
      expect(yaounde1).toBeDefined();
      const centreAdmin = yaounde1?.district("Centre Administratif");
      expect(centreAdmin).toBeDefined();
      expect(centreAdmin?.name).toBe("Centre Administratif");
    });
  });

  describe("getDistricts", () => {
    it("should return all districts", () => {
      const districts = getDistricts();
      expect(districts).toBeDefined();
      expect(districts.length).toBeGreaterThan(0);
      expect(districts[0]).toHaveProperty("code");
      expect(districts[0]).toHaveProperty("name");
      expect(districts[0]).toHaveProperty("subdivision");
    });
  });

  describe("getDistrictByCode", () => {
    it("should return a district by code", () => {
      const centreAdmin = getDistrictByCode("02070101");
      expect(centreAdmin).toBeDefined();
      expect(centreAdmin?.code).toBe("02070101");
      expect(centreAdmin?.name).toBe("Centre Administratif");
    });
  });

  describe("district wrapper", () => {
    it("should provide chainable API for subdivision, division and region", () => {
      const centreAdmin = district("Centre Administratif");
      expect(centreAdmin).toBeDefined();

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
  });

  describe("getDivisionsInRegion", () => {
    it("should return divisions in Centre region", () => {
      const divisions = getDivisionsInRegion("Centre");
      expect(divisions).toBeDefined();
      expect(divisions.length).toBe(10);
      expect(divisions.every((d) => d.region === "Centre")).toBe(true);
    });

    it("should return divisions in Adamawa region by code", () => {
      const divisions = getDivisionsInRegion("01");
      expect(divisions).toBeDefined();
      expect(divisions.length).toBe(5);
      expect(divisions.every((d) => d.region === "Adamaoua")).toBe(true);
    });

    it("should return empty array for non-existent region", () => {
      const divisions = getDivisionsInRegion("NonExistent");
      expect(divisions).toEqual([]);
    });
  });

  describe("getSubdivisionsInDivision", () => {
    it("should return subdivisions in Mfoundi division", () => {
      const subdivisions = getSubdivisionsInDivision("Mfoundi");
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBe(7);
      expect(subdivisions.every((s) => s.division === "Mfoundi")).toBe(true);
    });

    it("should return empty array for non-existent division", () => {
      const subdivisions = getSubdivisionsInDivision("NonExistent");
      expect(subdivisions).toEqual([]);
    });
  });

  describe("getDistrictsInSubdivision", () => {
    it("should return districts in Yaoundé I subdivision", () => {
      const districts = getDistrictsInSubdivision("Yaoundé I");
      expect(districts).toBeDefined();
      expect(districts.length).toBe(3);
      expect(districts.every((d) => d.subdivision === "Yaoundé I")).toBe(true);
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

    it("should get subdivision of district", () => {
      const subdivision = getSubdivisionOfDistrict("Centre Administratif");
      expect(subdivision).toBeDefined();
      expect(subdivision?.name).toBe("Yaoundé I");
      expect(subdivision?.code).toBe("020701");
    });

    it("should return undefined for non-existent relationships", () => {
      expect(getRegionOfDivision("NonExistent")).toBeUndefined();
      expect(getDivisionOfSubdivision("NonExistent")).toBeUndefined();
      expect(getSubdivisionOfDistrict("NonExistent")).toBeUndefined();
    });
  });

  describe("search", () => {
    it("should search across all administrative divisions", () => {
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

    it("should search only divisions", () => {
      const results = searchByType("Mfoundi", "division");
      expect(results).toBeDefined();
      expect(results.every((r) => r.type === "division")).toBe(true);
    });
  });

  describe("CameroonLocations static class", () => {
    it("should provide all methods as static", () => {
      expect(typeof CameroonLocations.getRegions).toBe("function");
      expect(typeof CameroonLocations.getDivisions).toBe("function");
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
});
