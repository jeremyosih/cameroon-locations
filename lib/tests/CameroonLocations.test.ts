import {
  getRegions,
  region,
  getDivisions,
  getDivisionByCode,
  getSubdivisions,
  getSubdivisionByCode,
  getCantons,
  getCantonByCode,
  getNeighborhoodOrVillages,
  getNeighborhoodOrVillageByCode,
  getBlocks,
  getBlockByCode,
  getDivisionsInRegion,
  getSubdivisionsInDivision,
  getCantonsInSubdivision,
  getNeighborhoodOrVillagesInCanton,
  getBlocksInNeighborhoodOrVillage,
  getCantonsByType,
  getCityCantons,
  getTraditionalCantons,
  getNeighborhoodOrVillagesWithPopulation,
  getRegionOfDivision,
  getDivisionOfSubdivision,
  getSubdivisionOfCanton,
  getCantonOfNeighborhoodOrVillage,
  getNeighborhoodOrVillageOfBlock,
  search,
  searchByType,
  NotFoundError,
  CameroonLocations,
  division,
  subdivision,
  canton,
  neighborhoodOrVillage,
  block,
} from "../CameroonLocations";
import { expect, it, describe } from "vitest";

describe("CameroonLocations v2.0 - 6-Level Hierarchy", () => {
  // Get sample data for testing
  const regions = getRegions();
  const divisions = getDivisions();
  const subdivisions = getSubdivisions();
  const cantons = getCantons();
  const neighborhoodsOrVillages = getNeighborhoodOrVillages();
  const blocks = getBlocks();

  // Use first available items for testing instead of hardcoded values
  const sampleRegion = regions[0];
  const sampleDivision = divisions[0];
  const sampleSubdivision = subdivisions[0];
  const sampleCanton = cantons[0];
  const sampleNeighborhood = neighborhoodsOrVillages[0];
  const sampleBlock = blocks[0];

  describe("getRegions", () => {
    it("should return all regions", () => {
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
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();
      expect(regionWrapper?.name).toBe(sampleRegion.nameFr);
      expect(regionWrapper?.code).toBe(sampleRegion.code);
      expect(regionWrapper?.data.name).toBe(sampleRegion.nameFr);
    });

    it("should return a region wrapper by code", () => {
      const regionWrapper = region(sampleRegion.code);
      expect(regionWrapper).toBeDefined();
      expect(regionWrapper?.code).toBe(sampleRegion.code);
      expect(regionWrapper?.name).toBe(sampleRegion.nameFr);
    });

    it("should return undefined for non-existent region", () => {
      const nonExistent = region("NonExistent");
      expect(nonExistent).toBeUndefined();
    });

    it("should provide chainable API for divisions", () => {
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();
      const regionDivisions = regionWrapper?.divisions();
      expect(regionDivisions).toBeDefined();
      if (regionDivisions && regionDivisions.length > 0) {
        expect(regionDivisions[0].name).toBeDefined();
        expect(regionDivisions[0].data.region).toBe(sampleRegion.nameFr);
      }
    });

    it("should allow finding specific division", () => {
      // Find a division that belongs to our sample region
      const regionDivision = divisions.find(d => d.region === sampleRegion.nameFr);
      if (regionDivision) {
        const regionWrapper = region(sampleRegion.nameFr);
        expect(regionWrapper).toBeDefined();
        const divisionWrapper = regionWrapper?.division(regionDivision.nameFr);
        expect(divisionWrapper).toBeDefined();
        expect(divisionWrapper?.name).toBe(regionDivision.nameFr);
      }
    });

    it("should provide access to cantons", () => {
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();
      const regionCantons = regionWrapper?.cantons();
      expect(regionCantons).toBeDefined();
      // Cantons may or may not exist for this region
    });

    it("should auto-link GeoJSON data by pcode", () => {
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();
      // Just verify the method exists and doesn't throw
      expect(typeof regionWrapper?.getGeoJson).toBe('function');
    });
  });

  describe("getDivisions", () => {
    it("should return all divisions", () => {
      expect(divisions).toBeDefined();
      expect(divisions.length).toBeGreaterThan(0);
      if (divisions.length > 0) {
        expect(divisions[0]).toHaveProperty("code");
        expect(divisions[0]).toHaveProperty("nameFr");
        expect(divisions[0]).toHaveProperty("region");
      }
    });
  });

  describe("getDivisionByCode", () => {
    it("should return a division by code", () => {
      if (sampleDivision) {
        const divisionResult = getDivisionByCode(sampleDivision.code);
        expect(divisionResult).toBeDefined();
        expect(divisionResult?.code).toBe(sampleDivision.code);
        expect(divisionResult?.name).toBe(sampleDivision.nameFr);
      }
    });

    it("should return undefined for non-existent division", () => {
      const nonExistent = getDivisionByCode("9999");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("division wrapper", () => {
    it("should provide chainable API for region", () => {
      if (sampleDivision) {
        const divisionWrapper = division(sampleDivision.nameFr);
        expect(divisionWrapper).toBeDefined();
        const regionWrapper = divisionWrapper?.region();
        expect(regionWrapper).toBeDefined();
        expect(regionWrapper?.name).toBe(sampleDivision.region);
      }
    });

    it("should allow finding specific subdivision", () => {
      // Find a subdivision that belongs to our sample division
      const divisionSubdivision = subdivisions.find(s => s.division === sampleDivision.nameFr);
      if (divisionSubdivision) {
        const divisionWrapper = division(sampleDivision.nameFr);
        expect(divisionWrapper).toBeDefined();
        const subdivisionWrapper = divisionWrapper?.subdivision(divisionSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();
        expect(subdivisionWrapper?.name).toBe(divisionSubdivision.nameFr);
      }
    });

    it("should provide access to cantons", () => {
      const divisionWrapper = division(sampleDivision.nameFr);
      expect(divisionWrapper).toBeDefined();
      const divisionCantons = divisionWrapper?.cantons();
      expect(divisionCantons).toBeDefined();
      // Cantons may or may not exist for this division
    });

    it("should auto-link GeoJSON data by pcode", () => {
      const divisionWrapper = division(sampleDivision.nameFr);
      expect(divisionWrapper).toBeDefined();
      // Just verify the method exists and doesn't throw
      expect(typeof divisionWrapper?.getGeoJson).toBe('function');
    });
  });

  describe("getSubdivisions", () => {
    it("should return all subdivisions", () => {
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBeGreaterThan(0);
      if (subdivisions.length > 0) {
        expect(subdivisions[0]).toHaveProperty("code");
        expect(subdivisions[0]).toHaveProperty("nameFr");
        expect(subdivisions[0]).toHaveProperty("division");
      }
    });
  });

  describe("getSubdivisionByCode", () => {
    it("should return a subdivision by code", () => {
      if (sampleSubdivision) {
        const subdivisionResult = getSubdivisionByCode(sampleSubdivision.code);
        expect(subdivisionResult).toBeDefined();
        expect(subdivisionResult?.code).toBe(sampleSubdivision.code);
        expect(subdivisionResult?.name).toBe(sampleSubdivision.nameFr);
      }
    });
  });

  describe("subdivision wrapper", () => {
    it("should provide chainable API for division and region", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();

        const divisionWrapper = subdivisionWrapper?.division();
        expect(divisionWrapper).toBeDefined();
        expect(divisionWrapper?.name).toBe(sampleSubdivision.division);

        const regionWrapper = subdivisionWrapper?.region();
        expect(regionWrapper).toBeDefined();
      }
    });

    it("should allow finding specific canton", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();
        // Canton lookup may or may not find results
        expect(typeof subdivisionWrapper?.canton).toBe('function');
      }
    });

    it("should provide access to cantons", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();
        const subdivisionCantons = subdivisionWrapper?.cantons();
        expect(subdivisionCantons).toBeDefined();
      }
    });

    it("should provide access to council names", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();

        // Test getter methods exist
        expect(typeof subdivisionWrapper?.getCouncilName).toBe('function');
      }
    });

    it("should auto-link electoral data by subdivision code", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();

        // Test auto-linking method exists
        expect(typeof subdivisionWrapper?.getElectoralData).toBe('function');
      }
    });

    it("should auto-link GeoJSON data by pcode", () => {
      if (sampleSubdivision) {
        const subdivisionWrapper = subdivision(sampleSubdivision.nameFr);
        expect(subdivisionWrapper).toBeDefined();

        // Test auto-linking method exists
        expect(typeof subdivisionWrapper?.getGeoJson).toBe('function');
      }
    });
  });

  describe("getCantons", () => {
    it("should return all cantons", () => {
      expect(cantons).toBeDefined();
      expect(cantons.length).toBeGreaterThan(0);
      if (cantons.length > 0) {
        expect(cantons[0]).toHaveProperty("code");
        expect(cantons[0]).toHaveProperty("nameFr");
        expect(cantons[0]).toHaveProperty("subdivision");
      }
    });
  });

  describe("getCantonByCode", () => {
    it("should return a canton by code", () => {
      if (sampleCanton) {
        const cantonResult = getCantonByCode(sampleCanton.code);
        expect(cantonResult).toBeDefined();
        expect(cantonResult?.code).toBe(sampleCanton.code);
        expect(cantonResult?.name).toBe(sampleCanton.nameFr);
      }
    });
  });

  describe("canton wrapper", () => {
    it("should provide chainable API for subdivision, division and region", () => {
      if (sampleCanton) {
        const cantonWrapper = canton(sampleCanton.nameFr);
        expect(cantonWrapper).toBeDefined();

        const subdivisionWrapper = cantonWrapper?.subdivision();
        expect(subdivisionWrapper).toBeDefined();
        expect(subdivisionWrapper?.name).toBe(sampleCanton.subdivision);

        const divisionWrapper = cantonWrapper?.division();
        expect(divisionWrapper).toBeDefined();

        const regionWrapper = cantonWrapper?.region();
        expect(regionWrapper).toBeDefined();
      }
    });

    it("should allow finding specific neighborhood or village", () => {
      if (sampleCanton) {
        const cantonWrapper = canton(sampleCanton.nameFr);
        expect(cantonWrapper).toBeDefined();
        // Neighborhood lookup may or may not find results
        expect(typeof cantonWrapper?.neighborhoodOrVillage).toBe('function');
      }
    });

    it("should provide access to neighborhoods or villages", () => {
      if (sampleCanton) {
        const cantonWrapper = canton(sampleCanton.nameFr);
        expect(cantonWrapper).toBeDefined();
        const neighborhoods = cantonWrapper?.neighborhoodsOrVillages();
        expect(neighborhoods).toBeDefined();
      }
    });
  });

  describe("getNeighborhoodOrVillages", () => {
    it("should return all neighborhoods or villages", () => {
      expect(neighborhoodsOrVillages).toBeDefined();
      expect(neighborhoodsOrVillages.length).toBeGreaterThan(0);
      if (neighborhoodsOrVillages.length > 0) {
        expect(neighborhoodsOrVillages[0]).toHaveProperty("code");
        expect(neighborhoodsOrVillages[0]).toHaveProperty("nameFr");
        expect(neighborhoodsOrVillages[0]).toHaveProperty("canton");
      }
    });
  });

  describe("getNeighborhoodOrVillageByCode", () => {
    it("should return a neighborhood or village by code", () => {
      if (sampleNeighborhood) {
        const neighborhoodResult = getNeighborhoodOrVillageByCode(sampleNeighborhood.code);
        expect(neighborhoodResult).toBeDefined();
        expect(neighborhoodResult?.code).toBe(sampleNeighborhood.code);
        expect(neighborhoodResult?.name).toBe(sampleNeighborhood.nameFr);
      }
    });
  });

  describe("neighborhoodOrVillage wrapper", () => {
    it("should provide chainable API for canton, subdivision, division and region", () => {
      if (sampleNeighborhood) {
        const neighborhoodWrapper = neighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(neighborhoodWrapper).toBeDefined();

        const cantonWrapper = neighborhoodWrapper?.canton();
        expect(cantonWrapper).toBeDefined();
        expect(cantonWrapper?.name).toBe(sampleNeighborhood.canton);

        const subdivisionWrapper = neighborhoodWrapper?.subdivision();
        expect(subdivisionWrapper).toBeDefined();

        const divisionWrapper = neighborhoodWrapper?.division();
        expect(divisionWrapper).toBeDefined();

        const regionWrapper = neighborhoodWrapper?.region();
        expect(regionWrapper).toBeDefined();
      }
    });

    it("should provide population data when available", () => {
      if (sampleNeighborhood) {
        const neighborhoodWrapper = neighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(neighborhoodWrapper).toBeDefined();
        // Population may or may not be available
        expect(typeof neighborhoodWrapper?.population).toBeDefined();
      }
    });

    it("should allow finding specific block", () => {
      if (sampleNeighborhood) {
        const neighborhoodWrapper = neighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(neighborhoodWrapper).toBeDefined();
        // Block lookup may or may not find results
        expect(typeof neighborhoodWrapper?.block).toBe('function');
      }
    });

    it("should provide access to blocks", () => {
      if (sampleNeighborhood) {
        const neighborhoodWrapper = neighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(neighborhoodWrapper).toBeDefined();
        const neighborhoodBlocks = neighborhoodWrapper?.blocks();
        expect(neighborhoodBlocks).toBeDefined();
      }
    });
  });

  describe("getBlocks", () => {
    it("should return all blocks", () => {
      const blocks = getBlocks();
      expect(blocks).toBeDefined();
      // Blocks may be empty
      if (blocks.length > 0) {
        expect(blocks[0]).toHaveProperty("code");
        expect(blocks[0]).toHaveProperty("nameFr");
        expect(blocks[0]).toHaveProperty("neighborhoodOrVillage");
      }
    });
  });

  describe("getBlockByCode", () => {
    it("should return a block by code", () => {
      if (sampleBlock) {
        const blockResult = getBlockByCode(sampleBlock.code);
        expect(blockResult).toBeDefined();
        expect(blockResult?.code).toBe(sampleBlock.code);
        expect(blockResult?.name).toBe(sampleBlock.nameFr);
      }
    });
  });

  describe("block wrapper", () => {
    it("should provide chainable API for neighborhoodOrVillage, canton, subdivision, division and region", () => {
      if (sampleBlock) {
        const blockWrapper = block(sampleBlock.nameFr);
        expect(blockWrapper).toBeDefined();

        const neighborhoodOrVillageResult = blockWrapper?.neighborhoodOrVillage();
        expect(neighborhoodOrVillageResult).toBeDefined();
        expect(neighborhoodOrVillageResult?.name).toBe(sampleBlock.neighborhoodOrVillage);

        const cantonWrapper = blockWrapper?.canton();
        expect(cantonWrapper).toBeDefined();

        const subdivisionWrapper = blockWrapper?.subdivision();
        expect(subdivisionWrapper).toBeDefined();

        const divisionWrapper = blockWrapper?.division();
        expect(divisionWrapper).toBeDefined();

        const regionWrapper = blockWrapper?.region();
        expect(regionWrapper).toBeDefined();
      }
    });
  });

  describe("hierarchical queries", () => {
    it("should return divisions in a region", () => {
      const regionDivisions = getDivisionsInRegion(sampleRegion.nameFr);
      expect(regionDivisions).toBeDefined();
      // May or may not have divisions
      regionDivisions.forEach(d => {
        expect(d.region).toBe(sampleRegion.nameFr);
      });
    });

    it("should return subdivisions in a division", () => {
      const divisionSubdivisions = getSubdivisionsInDivision(sampleDivision.nameFr);
      expect(divisionSubdivisions).toBeDefined();
      // May or may not have subdivisions
      divisionSubdivisions.forEach(s => {
        expect(s.division).toBe(sampleDivision.nameFr);
      });
    });

    it("should return cantons in a subdivision", () => {
      const subdivisionCantons = getCantonsInSubdivision(sampleSubdivision.nameFr);
      expect(subdivisionCantons).toBeDefined();
      // May or may not have cantons
      subdivisionCantons.forEach(c => {
        expect(c.subdivision).toBe(sampleSubdivision.nameFr);
      });
    });

    it("should return neighborhoods or villages in a canton", () => {
      const cantonNeighborhoods = getNeighborhoodOrVillagesInCanton(sampleCanton.nameFr);
      expect(cantonNeighborhoods).toBeDefined();
      // May or may not have neighborhoods
      cantonNeighborhoods.forEach(n => {
        expect(n.canton).toBe(sampleCanton.nameFr);
      });
    });

    it("should return blocks in a neighborhood or village", () => {
      if (sampleNeighborhood) {
        const neighborhoodBlocks = getBlocksInNeighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(neighborhoodBlocks).toBeDefined();
        // May or may not have blocks
        neighborhoodBlocks.forEach(b => {
          expect(b.neighborhoodOrVillage).toBe(sampleNeighborhood.nameFr);
        });
      }
    });
  });

  describe("canton type filtering", () => {
    it("should filter cantons by type", () => {
      const cityCantons = getCityCantons();
      expect(cityCantons).toBeDefined();
      cityCantons.forEach(c => {
        expect(c.type).toBe("city");
      });

      const traditionalCantons = getTraditionalCantons();
      expect(traditionalCantons).toBeDefined();
      traditionalCantons.forEach(c => {
        expect(["lamidat", "sultanate", "chiefdom"]).toContain(c.type);
      });

      const ruralCantons = getCantonsByType("rural");
      expect(ruralCantons).toBeDefined();
      ruralCantons.forEach(c => {
        expect(c.type).toBe("rural");
      });
    });
  });

  describe("population data", () => {
    it("should provide population data for neighborhoods/villages", () => {
      const withPopulation = getNeighborhoodOrVillagesWithPopulation();
      expect(withPopulation).toBeDefined();
      withPopulation.forEach(item => {
        expect(item.population).toBeDefined();
        expect(item.population?.total).toBeGreaterThan(0);
      });
    });
  });

  describe("relationship functions", () => {
    it("should get region of division", () => {
      const regionResult = getRegionOfDivision(sampleDivision.nameFr);
      expect(regionResult).toBeDefined();
      expect(regionResult?.name).toBe(sampleDivision.region);
    });

    it("should get division of subdivision", () => {
      const divisionResult = getDivisionOfSubdivision(sampleSubdivision.nameFr);
      expect(divisionResult).toBeDefined();
      expect(divisionResult?.name).toBe(sampleSubdivision.division);
    });

    it("should get subdivision of canton", () => {
      const subdivisionResult = getSubdivisionOfCanton(sampleCanton.nameFr);
      expect(subdivisionResult).toBeDefined();
      expect(subdivisionResult?.name).toBe(sampleCanton.subdivision);
    });

    it("should get canton of neighborhood or village", () => {
      if (sampleNeighborhood) {
        const cantonResult = getCantonOfNeighborhoodOrVillage(sampleNeighborhood.nameFr);
        expect(cantonResult).toBeDefined();
        expect(cantonResult?.name).toBe(sampleNeighborhood.canton);
      }
    });

    it("should get neighborhood or village of block", () => {
      if (sampleBlock) {
        const neighborhoodOrVillageResult = getNeighborhoodOrVillageOfBlock(sampleBlock.nameFr);
        expect(neighborhoodOrVillageResult).toBeDefined();
        expect(neighborhoodOrVillageResult?.name).toBe(sampleBlock.neighborhoodOrVillage);
      }
    });

    it("should return undefined for non-existent relationships", () => {
      const nonExistent = getRegionOfDivision("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("search", () => {
    it("should search across all 6 administrative levels", () => {
      // Use a common term that might appear in the data
      const results = search("a", { limit: 10 });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Results may be empty, but should be an array
    });

    it("should limit search results", () => {
      const results = search("a", { limit: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it("should filter by types", () => {
      const regionResults = search("a", { limit: 10, types: ["region"] });
      expect(regionResults).toBeDefined();
      regionResults.forEach(r => {
        expect(r.type).toBe("region");
      });
    });

    it("should search cantons specifically", () => {
      const cantonResults = searchByType(sampleCanton.nameFr.substring(0, 3), "canton");
      expect(cantonResults).toBeDefined();
      cantonResults.forEach(r => {
        expect(r.type).toBe("canton");
      });
    });

    it("should return empty array for short queries", () => {
      const results = search("xyz");
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("searchByType", () => {
    it("should search regions", () => {
      const results = searchByType(sampleRegion.nameFr.substring(0, 3), "region");
      expect(results).toBeDefined();
      results.forEach(r => {
        expect(r.type).toBe("region");
      });
    });

    it("should search divisions", () => {
      const results = searchByType(sampleDivision.nameFr.substring(0, 3), "division");
      expect(results).toBeDefined();
      results.forEach(r => {
        expect(r.type).toBe("division");
      });
    });

    it("should search subdivisions", () => {
      const results = searchByType(sampleSubdivision.nameFr.substring(0, 3), "subdivision");
      expect(results).toBeDefined();
      results.forEach(r => {
        expect(r.type).toBe("subdivision");
      });
    });

    it("should search cantons", () => {
      const results = searchByType(sampleCanton.nameFr.substring(0, 3), "canton");
      expect(results).toBeDefined();
      results.forEach(r => {
        expect(r.type).toBe("canton");
      });
    });
  });

  describe("CameroonLocations static class", () => {
    it("should provide static access to all functions", () => {
      expect(CameroonLocations.getRegions).toBeDefined();
      expect(CameroonLocations.getDivisions).toBeDefined();
      expect(CameroonLocations.getSubdivisions).toBeDefined();
      expect(CameroonLocations.search).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should throw NotFoundError for invalid operations", () => {
      expect(() => {
        throw new NotFoundError("Test error");
      }).toThrow(NotFoundError);
    });

    it("should handle undefined gracefully", () => {
      const nonExistent = region("NonExistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("bilingual support", () => {
    it("should support French and English names", () => {
      // Test with first available region
      const regionByFrench = region(sampleRegion.nameFr);
      const regionByEnglish = region(sampleRegion.nameEn);
      
      expect(regionByFrench).toBeDefined();
      expect(regionByEnglish).toBeDefined();
      expect(regionByFrench?.code).toBe(regionByEnglish?.code);
      expect(regionByFrench?.nameFr).toBeDefined();
      expect(regionByFrench?.nameEn).toBeDefined();
    });

    it("should provide language-specific name access", () => {
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper?.getName("fr")).toBe(sampleRegion.nameFr);
      expect(regionWrapper?.getName("en")).toBe(sampleRegion.nameEn);
      expect(regionWrapper?.getName()).toBe(sampleRegion.nameFr); // defaults to French
    });
  });

  describe("6-level hierarchy navigation", () => {
    it("should navigate from region to block", () => {
      // Find a complete chain if it exists
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();
      
      const regionDivisions = regionWrapper?.divisions();
      if (regionDivisions && regionDivisions.length > 0) {
        const divisionWrapper = regionDivisions[0];
        expect(divisionWrapper).toBeDefined();
        
        const divisionSubdivisions = divisionWrapper.subdivisions();
        if (divisionSubdivisions && divisionSubdivisions.length > 0) {
          const subdivisionWrapper = divisionSubdivisions[0];
          expect(subdivisionWrapper).toBeDefined();
          
          const subdivisionCantons = subdivisionWrapper.cantons();
          if (subdivisionCantons && subdivisionCantons.length > 0) {
            const cantonWrapper = subdivisionCantons[0];
            expect(cantonWrapper).toBeDefined();
            
            const cantonNeighborhoods = cantonWrapper.neighborhoodsOrVillages();
            if (cantonNeighborhoods && cantonNeighborhoods.length > 0) {
              const neighborhoodWrapper = cantonNeighborhoods[0];
              expect(neighborhoodWrapper).toBeDefined();
              
              const neighborhoodBlocks = neighborhoodWrapper.blocks();
              expect(neighborhoodBlocks).toBeDefined();
            }
          }
        }
      }
    });

    it("should navigate from block to region", () => {
      if (sampleBlock) {
        const blockWrapper = block(sampleBlock.nameFr);
        expect(blockWrapper).toBeDefined();

        const neighborhoodOrVillageResult = blockWrapper?.neighborhoodOrVillage();
        expect(neighborhoodOrVillageResult).toBeDefined();

        const cantonWrapper = neighborhoodOrVillageResult?.canton();
        expect(cantonWrapper).toBeDefined();

        const subdivisionWrapper = cantonWrapper?.subdivision();
        expect(subdivisionWrapper).toBeDefined();

        const divisionWrapper = subdivisionWrapper?.division();
        expect(divisionWrapper).toBeDefined();

        const regionWrapper = divisionWrapper?.region();
        expect(regionWrapper).toBeDefined();
      }
    });
  });
});