import {
  getCounties,
  county,
  getConstituencies,
  getConstituencyByCode,
  getWards,
  getWardsInCounty,
  getCountyOfWard,
  search,
  getSubCounties,
  getSubCountiesInCounty,
  getCountyOfSubCounty,
  getLocalities,
  getAreas,
  getLocalityByName,
  getAreaByName,
  getLocalitiesInCounty,
  getAreasInLocality,
  getAreasInCounty,
  getCountyOfLocality,
  getCountyOfArea,
  getLocalityOfArea,
  locality,
  NotFoundError,
} from "../KenyaLocations";
import { expect, it, describe } from "vitest";

describe("KenyaLocations", () => {
  describe("getCounties", () => {
    it("should return all counties", () => {
      const counties = getCounties();
      expect(counties).toBeDefined();
      expect(counties.length).toBeGreaterThan(0);
    });
  });

  describe("county", () => {
    it("should return a county by name", () => {
      const mombasa = county("Mombasa");
      expect(mombasa).toBeDefined();
      expect(mombasa?.name).toBe("Mombasa");
    });

    it("should return a county by code", () => {
      const mombasa = county("001");
      expect(mombasa).toBeDefined();
      expect(mombasa?.code).toBe("001");
    });

    it("should return undefined for non-existent county", () => {
      const nonExistent = county("NonExistent");
      expect(nonExistent).toBeUndefined();
    });

    it("should provide access to localities and areas", () => {
      const nairobi = county("Nairobi");
      expect(nairobi).toBeDefined();

      // Test localities
      const localities = nairobi?.localities();
      expect(localities).toBeDefined();
      expect(localities!.length).toBeGreaterThan(0);

      // Test areas
      const areas = nairobi?.areas();
      expect(areas).toBeDefined();
      expect(areas!.length).toBeGreaterThan(0);

      // Test getting a specific locality
      const westlands = nairobi?.locality("Westlands");
      expect(westlands).toBeDefined();
      expect(westlands?.name).toBe("Westlands");

      // Test areas by locality
      const westlandsAreas = nairobi?.areasByLocality("Westlands");
      expect(westlandsAreas).toBeDefined();
      expect(westlandsAreas!.length).toBeGreaterThan(0);
    });

    it("should throw error for non-existent locality", () => {
      const nairobi = county("Nairobi");
      expect(() => {
        nairobi?.locality("NonExistentLocality");
      }).toThrow(NotFoundError);
    });
  });

  describe("getConstituencies", () => {
    it("should return all constituencies", () => {
      const constituencies = getConstituencies();
      expect(constituencies).toBeDefined();
      expect(constituencies.length).toBeGreaterThan(0);
    });
  });

  describe("getConstituencyByCode", () => {
    it("should return a constituency by code", () => {
      const changamwe = getConstituencyByCode("001");
      expect(changamwe).toBeDefined();
      expect(changamwe?.code).toBe("001");
    });

    it("should return undefined for non-existent constituency", () => {
      const nonExistent = getConstituencyByCode("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getWards", () => {
    it("should return all wards", () => {
      const wards = getWards();
      expect(wards).toBeDefined();
      expect(wards.length).toBeGreaterThan(0);

      // Check that wards now have constituency field instead of constituencyCode
      const firstWard = wards[0];
      expect(firstWard).toHaveProperty("constituency");
      expect(typeof firstWard.constituency).toBe("string");
    });
  });

  describe("getWardsInCounty", () => {
    it("should return all wards in a county", () => {
      const wards = getWardsInCounty("001");
      expect(wards).toBeDefined();
      expect(wards.length).toBeGreaterThan(0);
    });

    it("should return an empty array for non-existent county", () => {
      const wards = getWardsInCounty("NonExistent");
      expect(wards).toEqual([]);
    });
  });

  describe("getCountyOfWard", () => {
    it("should return undefined for non-existent ward", () => {
      const county = getCountyOfWard("NonExistentWard");
      expect(county).toBeUndefined();
    });
  });

  describe("getSubCounties", () => {
    it("should return all sub-counties", () => {
      const subCounties = getSubCounties();
      expect(subCounties).toBeDefined();
      expect(subCounties.length).toBeGreaterThan(0);
    });
  });

  describe("getSubCountiesInCounty", () => {
    it("should return all sub-counties in a county", () => {
      // Using Nairobi county code (047)
      const subCounties = getSubCountiesInCounty("047");
      expect(subCounties).toBeDefined();
      expect(subCounties.length).toBeGreaterThan(0);
      // Verify all returned sub-counties belong to the specified county
      subCounties.forEach((sc) => {
        expect(sc.county).toBe("Nairobi");
      });
    });

    it("should return an empty array for non-existent county", () => {
      const subCounties = getSubCountiesInCounty("NonExistent");
      expect(subCounties).toEqual([]);
    });
  });

  describe("getCountyOfSubCounty", () => {
    it("should return the county of a sub-county", () => {
      // Get the first sub-county to ensure it exists
      const subCounties = getSubCounties();
      const firstSubCounty = subCounties[0];

      const countyObj = getCountyOfSubCounty(firstSubCounty.name);
      expect(countyObj).toBeDefined();
      expect(countyObj?.name).toBe(firstSubCounty.county);
    });

    it("should return undefined for non-existent sub-county", () => {
      const nonExistent = getCountyOfSubCounty("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getLocalities", () => {
    it("should return all localities", () => {
      const localities = getLocalities();
      expect(localities).toBeDefined();
      expect(localities.length).toBeGreaterThan(0);

      // Check structure of first locality
      const firstLocality = localities[0];
      expect(firstLocality).toHaveProperty("name");
      expect(firstLocality).toHaveProperty("county");
    });
  });

  describe("getAreas", () => {
    it("should return all areas", () => {
      const areas = getAreas();
      expect(areas).toBeDefined();
      expect(areas.length).toBeGreaterThan(0);

      // Check structure of first area
      const firstArea = areas[0];
      expect(firstArea).toHaveProperty("name");
      expect(firstArea).toHaveProperty("locality");
      expect(firstArea).toHaveProperty("county");
    });
  });

  describe("getLocalityByName", () => {
    it("should return a locality by name", () => {
      const westlands = getLocalityByName("Westlands");
      expect(westlands).toBeDefined();
      expect(westlands?.name).toBe("Westlands");
      expect(westlands?.county).toBe("Nairobi");
    });

    it("should return undefined for non-existent locality", () => {
      const nonExistent = getLocalityByName("NonExistentLocality");
      expect(nonExistent).toBeUndefined();
    });

    it("should provide access to areas and county", () => {
      const westlands = getLocalityByName("Westlands");
      expect(westlands).toBeDefined();

      // Test areas
      const areas = westlands?.areas();
      expect(areas).toBeDefined();
      expect(areas!.length).toBeGreaterThan(0);

      // Test getting county
      const county = westlands?.getCounty();
      expect(county).toBeDefined();
      expect(county?.name).toBe("Nairobi");

      // Test getting specific area
      const gigiri = westlands?.area("Gigiri");
      expect(gigiri).toBeDefined();
      expect(gigiri?.name).toBe("Gigiri");
    });

    it("should throw error for non-existent area", () => {
      const westlands = getLocalityByName("Westlands");
      expect(() => {
        westlands?.area("NonExistentArea");
      }).toThrow(NotFoundError);
    });
  });

  describe("getAreaByName", () => {
    it("should return an area by name", () => {
      const gigiri = getAreaByName("Gigiri");
      expect(gigiri).toBeDefined();
      expect(gigiri?.name).toBe("Gigiri");
      expect(gigiri?.locality).toBe("Westlands");
      expect(gigiri?.county).toBe("Nairobi");
    });

    it("should return undefined for non-existent area", () => {
      const nonExistent = getAreaByName("NonExistentArea");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getLocalitiesInCounty", () => {
    it("should return all localities in a county", () => {
      const nairobiLocalities = getLocalitiesInCounty("Nairobi");
      expect(nairobiLocalities).toBeDefined();
      expect(nairobiLocalities.length).toBeGreaterThan(0);

      // Verify all returned localities belong to the specified county
      nairobiLocalities.forEach((locality) => {
        expect(locality.county).toBe("Nairobi");
      });
    });

    it("should return an empty array for non-existent county", () => {
      const localities = getLocalitiesInCounty("NonExistentCounty");
      expect(localities).toEqual([]);
    });
  });

  describe("getAreasInLocality", () => {
    it("should return all areas in a locality", () => {
      const westlandsAreas = getAreasInLocality("Westlands");
      expect(westlandsAreas).toBeDefined();
      expect(westlandsAreas.length).toBeGreaterThan(0);

      // Verify all returned areas belong to the specified locality
      westlandsAreas.forEach((area) => {
        expect(area.locality).toBe("Westlands");
      });
    });

    it("should return an empty array for non-existent locality", () => {
      const areas = getAreasInLocality("NonExistentLocality");
      expect(areas).toEqual([]);
    });
  });

  describe("getAreasInCounty", () => {
    it("should return all areas in a county", () => {
      const nairobiAreas = getAreasInCounty("Nairobi");
      expect(nairobiAreas).toBeDefined();
      expect(nairobiAreas.length).toBeGreaterThan(0);

      // Verify all returned areas belong to the specified county
      nairobiAreas.forEach((area) => {
        expect(area.county).toBe("Nairobi");
      });
    });

    it("should return an empty array for non-existent county", () => {
      const areas = getAreasInCounty("NonExistentCounty");
      expect(areas).toEqual([]);
    });
  });

  describe("getCountyOfLocality", () => {
    it("should return the county of a locality", () => {
      const county = getCountyOfLocality("Westlands");
      expect(county).toBeDefined();
      expect(county?.name).toBe("Nairobi");
    });

    it("should return undefined for non-existent locality", () => {
      const nonExistent = getCountyOfLocality("NonExistentLocality");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getCountyOfArea", () => {
    it("should return the county of an area", () => {
      const county = getCountyOfArea("Gigiri");
      expect(county).toBeDefined();
      expect(county?.name).toBe("Nairobi");
    });

    it("should return undefined for non-existent area", () => {
      const nonExistent = getCountyOfArea("NonExistentArea");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getLocalityOfArea", () => {
    it("should return the locality of an area", () => {
      const locality = getLocalityOfArea("Gigiri");
      expect(locality).toBeDefined();
      expect(locality?.name).toBe("Westlands");
      expect(locality?.county).toBe("Nairobi");
    });

    it("should return undefined for non-existent area", () => {
      const nonExistent = getLocalityOfArea("NonExistentArea");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("locality", () => {
    it("should return a locality by name", () => {
      const westlands = locality("Westlands");
      expect(westlands).toBeDefined();
      expect(westlands?.name).toBe("Westlands");
    });

    it("should return a locality by name within a specific county", () => {
      const westlands = locality("Westlands", "Nairobi");
      expect(westlands).toBeDefined();
      expect(westlands?.name).toBe("Westlands");
      expect(westlands?.county).toBe("Nairobi");
    });

    it("should return undefined for non-existent locality", () => {
      const nonExistent = locality("NonExistentLocality");
      expect(nonExistent).toBeUndefined();
    });

    it("should return undefined for locality not in specified county", () => {
      const nonExistent = locality("Westlands", "Mombasa");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("search", () => {
    it("should return search results", () => {
      const results = search("Nairob");
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return an empty array for non-existent query", () => {
      const results = search("NonExistent");
      expect(results).toEqual([]);
    });

    it("should respect the limit parameter", () => {
      const results = search("Nairob", { limit: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should include localities and areas in search results", () => {
      const results = search("Westlands");
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Check if we get locality results
      const localityResults = results.filter((r) => r.type === "locality");
      expect(localityResults.length).toBeGreaterThan(0);

      const areas = search("Gigiri");
      expect(areas).toBeDefined();

      // Check if we get area results
      const areaResults = areas.filter((r) => r.type === "area");
      expect(areaResults.length).toBeGreaterThan(0);
    });

    it("should return results in priority order", () => {
      const results = search("Nairobi", { limit: 10 });
      expect(results).toBeDefined();

      // Counties should come first, then constituencies, etc.
      let lastTypeOrder = 0;
      const typeOrder = {
        county: 1,
        constituency: 2,
        ward: 3,
        "sub-county": 4,
        locality: 5,
        area: 6,
      };

      results.forEach((result) => {
        const currentTypeOrder = typeOrder[result.type];
        expect(currentTypeOrder).toBeGreaterThanOrEqual(lastTypeOrder);
        lastTypeOrder = currentTypeOrder;
      });
    });
  });
});
