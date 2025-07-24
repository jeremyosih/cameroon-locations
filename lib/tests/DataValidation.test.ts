import {
  getRegions,
  getDivisions,
  getSubdivisions,
  getCantons,
  getNeighborhoodOrVillages,
  getBlocks,
  subdivision,
  region
} from "../CameroonLocations";
import { electoralData } from "../extensions/elecam/data";
import { geoJsonData } from "../extensions/geojson/data";
import { describe, it, expect } from "vitest";

describe("Data Loading Validation", () => {
  describe("Core Data Validation", () => {
    it("should have loaded all 10 regions with correct data", () => {
      const regions = getRegions();
      expect(regions).toBeDefined();
      expect(regions.length).toBe(10);
      
      // Verify each region has required fields
      regions.forEach(region => {
        expect(region.code).toBeTypeOf('number');
        expect(region.code.toString()).toMatch(/^\d{1,2}$/); // 1-2 digit code
        expect(region.nameFr).toBeTruthy();
        expect(region.nameEn).toBeTruthy();
        // Names should exist but don't need to be different (some may be the same)
      });
    });

    it("should have loaded all divisions with proper parent mapping", () => {
      const divisions = getDivisions();
      expect(divisions).toBeDefined();
      expect(divisions.length).toBeGreaterThan(50); // Cameroon has 58 divisions
      
      // Verify each division has a valid parent region
      const regions = getRegions();
      const regionNames = regions.map(r => r.nameFr);
      
      divisions.forEach(division => {
        expect(division.code).toBeTypeOf('number');
        expect(division.code.toString()).toMatch(/^\d{1,4}$/); // 1-4 digit code
        expect(division.nameFr).toBeTruthy();
        expect(division.nameEn).toBeTruthy();
        expect(division.region).toBeTruthy();
        expect(regionNames).toContain(division.region);
        expect(division.regionCode).toBeTypeOf('number');
        expect(division.regionCode.toString()).toMatch(/^\d{1,2}$/);
      });
    });

    it("should have loaded all subdivisions with proper parent mapping", () => {
      const subdivisions = getSubdivisions();
      expect(subdivisions).toBeDefined();
      expect(subdivisions.length).toBeGreaterThan(300); // Cameroon has 360 subdivisions
      
      // Verify each subdivision has a valid parent division
      const divisions = getDivisions();
      const divisionNames = divisions.map(d => d.nameFr);
      
      subdivisions.forEach(subdivision => {
        expect(subdivision.code).toBeTypeOf('number');
        expect(subdivision.code.toString()).toMatch(/^\d{1,6}$/); // 1-6 digit code
        expect(subdivision.nameFr).toBeTruthy();
        expect(subdivision.nameEn).toBeTruthy();
        expect(subdivision.division).toBeTruthy();
        expect(divisionNames).toContain(subdivision.division);
        expect(subdivision.divisionCode).toBeTypeOf('number');
        expect(subdivision.divisionCode.toString()).toMatch(/^\d{1,4}$/);
      });
    });

    it("should have generated cantons matching subdivisions", () => {
      const cantons = getCantons();
      const subdivisions = getSubdivisions();
      
      expect(cantons).toBeDefined();
      expect(cantons.length).toBe(subdivisions.length); // 1:1 mapping
      
      const subdivisionNames = subdivisions.map(s => s.nameFr);
      
      cantons.forEach(canton => {
        expect(canton.code).toBeTypeOf('number');
        expect(canton.code.toString()).toMatch(/^\d{1,6}$/); // Same as subdivision code
        expect(canton.nameFr).toBeTruthy();
        expect(canton.nameEn).toBeTruthy();
        expect(canton.type).toMatch(/^(city|rural|group|lamidat|sultanate|sector|chiefdom|canton)$/);
        expect(subdivisionNames).toContain(canton.subdivision);
      });
    });

    it("should have loaded neighborhoods/villages with optional population", () => {
      const neighborhoodsOrVillages = getNeighborhoodOrVillages();
      expect(neighborhoodsOrVillages).toBeDefined();
      expect(neighborhoodsOrVillages.length).toBeGreaterThan(1000); // Should have many
      
      neighborhoodsOrVillages.forEach(item => {
        expect(item.code).toBeTypeOf('number');
        expect(item.code.toString()).toMatch(/^\d{1,8}$/); // 1-8 digit code
        expect(item.nameFr).toBeTruthy();
        expect(item.nameEn).toBeTruthy();
        expect(item.type).toMatch(/^(neighborhood|village|locality)$/);
        expect(item.canton).toBeTruthy();
        
        // Population is optional
        if (item.population) {
          expect(item.population.total).toBeGreaterThan(0);
          expect(item.population.male).toBeGreaterThanOrEqual(0);
          expect(item.population.female).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it("should have loaded blocks with proper parent mapping", () => {
      const blocks = getBlocks();
      expect(blocks).toBeDefined();
      // Blocks may be empty, that's okay
      
      blocks.forEach(block => {
        expect(block.code).toMatch(/^\d{10}$/); // 10-digit code
        expect(block.nameFr).toBeTruthy();
        expect(block.nameEn).toBeTruthy();
        expect(block.neighborhoodOrVillage).toBeTruthy();
        expect(block.neighborhoodOrVillageCode).toMatch(/^\d{8}$/);
      });
    });
  });

  describe("Data Integrity Validation", () => {
    it("should have proper parent-child code references", () => {
      const regions = getRegions();
      const divisions = getDivisions();
      const subdivisions = getSubdivisions();
      
      // Check divisions have valid parent region codes
      divisions.forEach(division => {
        const parentRegion = regions.find(r => r.code === division.regionCode);
        expect(parentRegion).toBeDefined();
        expect(division.region).toBe(parentRegion!.nameFr);
      });
      
      // Check subdivisions have valid parent division codes
      subdivisions.forEach(subdivision => {
        const parentDivision = divisions.find(d => d.code === subdivision.divisionCode);
        expect(parentDivision).toBeDefined();
        expect(subdivision.division).toBe(parentDivision!.nameFr);
      });
    });

    it("should have consistent bilingual naming", () => {
      const regions = getRegions();
      
      // Verify all regions have both French and English names
      regions.forEach(region => {
        expect(region.nameFr).toBeTruthy();
        expect(region.nameEn).toBeTruthy();
        expect(typeof region.nameFr).toBe('string');
        expect(typeof region.nameEn).toBe('string');
      });
    });

    it("should validate parent-child relationships across all levels", () => {
      const regions = getRegions();
      
      // Test with first available region
      const sampleRegion = regions[0];
      const regionWrapper = region(sampleRegion.nameFr);
      expect(regionWrapper).toBeDefined();

      const regionDivisions = regionWrapper!.divisions();
      expect(regionDivisions).toBeDefined();
      
      // If this region has divisions, test the relationship
      if (regionDivisions.length > 0) {
        const sampleDivision = regionDivisions[0];
        expect(sampleDivision).toBeDefined();
        expect(sampleDivision.name).toBeTruthy();
        
        const divisionSubdivisions = sampleDivision.subdivisions();
        expect(divisionSubdivisions).toBeDefined();
        
        // If this division has subdivisions, test further
        if (divisionSubdivisions.length > 0) {
          const sampleSubdivision = divisionSubdivisions[0];
          expect(sampleSubdivision).toBeDefined();
          expect(sampleSubdivision.name).toBeTruthy();
        }
      }
    });
  });

  describe("Extension Data Validation", () => {
    it("should have loaded electoral data with proper structure", () => {
      expect(electoralData).toBeDefined();
      expect(electoralData.metadata).toBeDefined();
      expect(electoralData.councils).toBeDefined();
      expect(Array.isArray(electoralData.councils)).toBe(true);
      
      // Verify metadata structure
      expect(electoralData.metadata.version).toBeTruthy();
      expect(electoralData.metadata.totalCouncils).toBeGreaterThan(0);
      expect(electoralData.metadata.totalVoters).toBeGreaterThan(0);
    });

    it("should return actual electoral data when available", () => {
      const subdivisions = getSubdivisions();
      let foundElectoralData = false;
      
      // Test a few subdivisions to see if electoral data is linked
      for (let i = 0; i < Math.min(10, subdivisions.length); i++) {
        const subdivisionWrapper = subdivision(subdivisions[i].nameFr);
        if (subdivisionWrapper) {
          const electoralDataResult = subdivisionWrapper.getElectoralData();
          if (electoralDataResult) {
            foundElectoralData = true;
            expect(electoralDataResult.subdivisionCode).toBeTruthy();
            expect(electoralDataResult.councilName).toBeTruthy();
            expect(electoralDataResult.totalVoters).toBeGreaterThan(0);
            break;
          }
        }
      }
      
      // At least some subdivisions should have electoral data
      if (electoralData.councils.length > 0) {
        expect(foundElectoralData).toBe(true);
      }
    });

    it("should have loaded GeoJSON data for all administrative levels", () => {
      expect(geoJsonData).toBeDefined();
      expect(geoJsonData.features).toBeDefined();
      expect(Array.isArray(geoJsonData.features)).toBe(true);
      expect(geoJsonData.features.length).toBeGreaterThan(0);
      
      // Verify feature structure
      const sampleFeature = geoJsonData.features[0];
      expect(sampleFeature.type).toBe("Feature");
      expect(sampleFeature.properties).toBeDefined();
      expect(sampleFeature.geometry).toBeDefined();
    });

    it("should return actual GeoJSON features when available", () => {
      const regions = getRegions();
      let foundGeoJsonData = false;
      
      // Test a few regions to see if GeoJSON data is linked
      for (let i = 0; i < Math.min(5, regions.length); i++) {
        const regionWrapper = region(regions[i].nameFr);
        if (regionWrapper) {
          const geoJsonResult = regionWrapper.getGeoJson();
          if (geoJsonResult) {
            foundGeoJsonData = true;
            expect(geoJsonResult.type).toBe("Feature");
            expect(geoJsonResult.properties).toBeDefined();
            expect(geoJsonResult.geometry).toBeDefined();
            break;
          }
        }
      }
      
      // At least some regions should have GeoJSON data
      if (geoJsonData.features.length > 0) {
        expect(foundGeoJsonData).toBe(true);
      }
    });

    it("should have proper pcode linking for GeoJSON", () => {
      const regions = getRegions();
      
      // Test that regions with pcodes can find GeoJSON data
      const regionsWithPcodes = regions.filter(r => r.pcode);
      expect(regionsWithPcodes.length).toBeGreaterThan(0);
      
      // At least one region should have matching GeoJSON data
      let foundMatch = false;
      for (const region of regionsWithPcodes) {
        const feature = geoJsonData.features.find(f => f.properties.pcode === region.pcode);
        if (feature) {
          foundMatch = true;
          break;
        }
      }
      
      if (geoJsonData.features.length > 0) {
        expect(foundMatch).toBe(true);
      }
    });

    it("should have proper subdivision code linking for electoral data", () => {
      const subdivisions = getSubdivisions();
      
      // Test that subdivisions can find electoral data
      let foundMatch = false;
      for (const subdivision of subdivisions.slice(0, 10)) {
        const council = electoralData.councils.find(c => c.subdivisionCode === subdivision.code);
        if (council) {
          foundMatch = true;
          expect(council.councilName).toBeTruthy();
          expect(council.totalVoters).toBeGreaterThan(0);
          break;
        }
      }
      
      if (electoralData.councils.length > 0) {
        expect(foundMatch).toBe(true);
      }
    });
  });

  describe("Data Statistics", () => {
    it("should have reasonable data counts", () => {
      const regions = getRegions();
      const divisions = getDivisions();
      const subdivisions = getSubdivisions();
      const cantons = getCantons();
      const neighborhoodsOrVillages = getNeighborhoodOrVillages();
      const blocks = getBlocks();
      
      expect(regions.length).toBe(10);
      expect(divisions.length).toBeGreaterThan(50);
      expect(subdivisions.length).toBeGreaterThan(300);
      expect(cantons.length).toBe(subdivisions.length); // 1:1 mapping
      expect(neighborhoodsOrVillages.length).toBeGreaterThan(1000);
      // Blocks may be 0, that's okay
      
      console.log(`Data loaded: ${regions.length} regions, ${divisions.length} divisions, ${subdivisions.length} subdivisions, ${cantons.length} cantons, ${neighborhoodsOrVillages.length} neighborhoods/villages, ${blocks.length} blocks`);
    });
  });
});