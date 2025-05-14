import {
  getAllCounties,
  county,
  getAllConstituencies,
  getConstituencyByCode,
  getAllWards,
  getWardByCode,
  getAllWardsInCounty,
  getCountyOfWard,
  search,
  getAllSubCounties,
  getSubCountyByCode,
  getSubCountiesInCounty,
  getCountyOfSubCounty,
} from "../KenyaLocations";

describe("KenyaLocations", () => {
  describe("getAllCounties", () => {
    it("should return all counties", () => {
      const counties = getAllCounties();
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
  });

  describe("getAllConstituencies", () => {
    it("should return all constituencies", () => {
      const constituencies = getAllConstituencies();
      expect(constituencies).toBeDefined();
      expect(constituencies.length).toBeGreaterThan(0);
    });
  });

  describe("getConstituencyByCode", () => {
    it("should return a constituency by code", () => {
      const changamwe = getConstituencyByCode("290");
      expect(changamwe).toBeDefined();
      expect(changamwe?.code).toBe("290");
    });

    it("should return undefined for non-existent constituency", () => {
      const nonExistent = getConstituencyByCode("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getAllWards", () => {
    it("should return all wards", () => {
      const wards = getAllWards();
      expect(wards).toBeDefined();
      expect(wards.length).toBeGreaterThan(0);
    });
  });

  describe("getWardByCode", () => {
    it("should return a ward by code", () => {
      const ward = getWardByCode("0001");
      expect(ward).toBeDefined();
      expect(ward?.code).toBe("0001");
    });

    it("should return undefined for non-existent ward", () => {
      const nonExistent = getWardByCode("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getAllWardsInCounty", () => {
    it("should return all wards in a county", () => {
      const wards = getAllWardsInCounty("001");
      expect(wards).toBeDefined();
      expect(wards.length).toBeGreaterThan(0);
    });

    it("should return an empty array for non-existent county", () => {
      const wards = getAllWardsInCounty("NonExistent");
      expect(wards).toEqual([]);
    });
  });

  describe("getCountyOfWard", () => {
    it("should return the county of a ward", () => {
      const county = getCountyOfWard("0001");
      expect(county).toBeDefined();
      expect(county?.code).toBe("001");
    });

    it("should return undefined for non-existent ward", () => {
      const nonExistent = getCountyOfWard("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getAllSubCounties", () => {
    it("should return all sub-counties", () => {
      const subCounties = getAllSubCounties();
      expect(subCounties).toBeDefined();
      expect(subCounties.length).toBeGreaterThan(0);
    });
  });

  describe("getSubCountyByCode", () => {
    it("should return a sub-county by code", () => {
      // Using the first sub-county from the list to ensure it exists
      const subCounties = getAllSubCounties();
      const firstSubCounty = subCounties[0];

      const subCounty = getSubCountyByCode(firstSubCounty.code);
      expect(subCounty).toBeDefined();
      expect(subCounty?.code).toBe(firstSubCounty.code);
    });

    it("should return undefined for non-existent sub-county", () => {
      const nonExistent = getSubCountyByCode("NonExistent");
      expect(nonExistent).toBeUndefined();
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
      const subCounties = getAllSubCounties();
      const firstSubCounty = subCounties[0];

      const countyObj = getCountyOfSubCounty(firstSubCounty.code);
      expect(countyObj).toBeDefined();
      expect(countyObj?.name).toBe(firstSubCounty.county);
    });

    it("should return undefined for non-existent sub-county", () => {
      const nonExistent = getCountyOfSubCounty("NonExistent");
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
      const results = search("Nairob", 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });
});
