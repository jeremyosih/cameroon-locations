/**
 * GeoJSON Types for Cameroon Administrative Boundaries
 */

export interface GeoJsonProperties {
  shapeName: string;
  shapeISO: string;
  shapeID: string;
  shapeGroup: string;
  shapeType: "ADM1" | "ADM2" | "ADM3"; // Region, Division, Subdivision
  area: number;
  pcode: string;
}

export interface GeoJsonGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonProperties;
  geometry: GeoJsonGeometry;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  crs: {
    type: "name";
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}