import { getGeoJsonByPcode } from "./data";
import type { GeoJsonFeature } from "./types";

/**
 * Get GeoJSON feature for a location by its pcode
 */
export function getGeoJson(pcode: string): GeoJsonFeature | undefined {
  return getGeoJsonByPcode(pcode);
}



// Export types for external use
export type { 
  GeoJsonFeature, 
  GeoJsonFeatureCollection, 
  GeoJsonProperties, 
  GeoJsonGeometry, 
  BoundingBox 
} from "./types";

// Export data access
export { geoJsonData } from "./data";