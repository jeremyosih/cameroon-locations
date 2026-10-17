/**
 * Public data model. Every record is a plain, frozen, JSON-serialisable
 * object. Administrative units are keyed by their OCHA P-code.
 */

/**
 * OCHA P-code: `CM001` (region), `CM001001` (division), `CM001001001`
 * (arrondissement). See `isPcode` for the format check.
 */
export type Pcode = string;

export type AdminLevel = "region" | "division" | "arrondissement";

export type Language = "fr" | "en";

/** Identifier of an entry in {@link SourceInfo}. */
export type SourceId =
  | "ocha-cod-ab-cmr"
  | "bucrep-rgph2005-repertoire-villages"
  | "elecam-polling-stations-2025"
  | "geoboundaries-cmr-gbopen"
  | "location-script-reference-tables"
  | "wikidata"
  | "research-2026-10-17"
  | "cameroon-locations-0.1.0-july-2025";

/** Display names in both official languages. Always both present. */
export interface LocalizedName {
  readonly fr: string;
  readonly en: string;
}

/** Another spelling seen in a source. Spellings are never discarded. */
export interface Alias {
  readonly name: string;
  readonly sources: readonly SourceId[];
  readonly lang?: Language;
}

/** 2005 census population (BUCREP RGPH 3), as printed. */
export interface Population {
  readonly total: number;
  readonly male: number;
  readonly female: number;
}

/** `[longitude, latitude]` in WGS 84, GeoJSON order. */
export type LngLat = readonly [lng: number, lat: number];

/** `[minLng, minLat, maxLng, maxLat]`, GeoJSON order. */
export type BBox = readonly [
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
];

interface AdminUnitBase<L extends AdminLevel> {
  readonly pcode: Pcode;
  readonly level: L;
  readonly name: LocalizedName;
  /** OCHA ASCII reference name. */
  readonly refName: string;
  readonly aliases: readonly Alias[];
  readonly hasc?: string;
  readonly wikidata?: string;
  readonly areaSqKm: number;
  readonly centroid: LngLat;
  readonly bbox: BBox;
  readonly population2005?: Population;
  readonly sources: readonly SourceId[];
}

/** Région (ADM1). 10 in total. */
export interface Region extends AdminUnitBase<"region"> {
  readonly parentPcode: null;
}

/** Département / Division (ADM2). 58 in total. */
export interface Division extends AdminUnitBase<"division"> {
  readonly parentPcode: Pcode;
  readonly regionPcode: Pcode;
}

/** Arrondissement / Subdivision (ADM3), one commune each. 360 in total. */
export interface Arrondissement extends AdminUnitBase<"arrondissement"> {
  readonly parentPcode: Pcode;
  readonly regionPcode: Pcode;
  readonly divisionPcode: Pcode;
  /** Ordinal of numbered arrondissements, e.g. 1 for "Yaoundé I". */
  readonly ordinal?: number;
}

export type AdminUnit = Region | Division | Arrondissement;

/** Canton, lamidat, groupement, urban "ville" block, as printed by BUCREP. */
export interface Canton {
  /** `<arrondissement pcode>-Cnn` */
  readonly id: string;
  readonly arrondissementPcode: Pcode;
  /** Name as printed in the source (upper case). */
  readonly name: string;
  /** Human-friendly casing of {@link Canton.name}. */
  readonly label: string;
  readonly population2005?: Population;
  readonly sources: readonly SourceId[];
}

/** Quartier or village, as printed by BUCREP. */
export interface Village {
  /** `<canton id>-Vnnn` */
  readonly id: string;
  readonly cantonId: string;
  readonly arrondissementPcode: Pcode;
  readonly name: string;
  readonly label: string;
  readonly population2005?: Population;
  readonly sources: readonly SourceId[];
}

/** One ELECAM polling station (2025 roll, probably the July 2025 provisional roll). */
export interface PollingStation {
  /** `null` for diaspora stations. */
  readonly arrondissementPcode: Pcode | null;
  readonly council: string;
  readonly centre: string;
  readonly station: string;
  readonly registeredVoters: number;
  readonly sources: readonly SourceId[];
}

/** ELECAM totals for one arrondissement's council. */
export interface CouncilElectoralSummary {
  readonly arrondissementPcode: Pcode;
  readonly council: string;
  readonly registeredVoters: number;
  readonly pollingCentres: number;
  readonly pollingStations: number;
  readonly sources: readonly SourceId[];
}

/** Provenance of a dataset. Shipped with every entry point. */
export interface SourceInfo {
  readonly id: SourceId;
  readonly title: string;
  readonly publisher: string;
  readonly license: string;
  readonly licenseUrl?: string;
  /** Where the source is published online. */
  readonly url: string;
  /** Archived copy and SOURCE.md in this repository. */
  readonly repositoryUrl: string;
  readonly retrieved: string;
  readonly attribution: string;
}

/**
 * Name, version and sources of the bundled dataset, exported as `metadata`.
 * GeoJSON files carry their own `metadata` member, stamped with the dataset
 * `version` they were built from.
 */
export interface DatasetMetadata {
  readonly name: string;
  readonly version: string;
  readonly generated: string;
  readonly repository: string;
  readonly sources: readonly SourceInfo[];
}
