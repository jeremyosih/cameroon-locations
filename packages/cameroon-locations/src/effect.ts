/**
 * `cameroon-locations/effect`: Effect v4 schemas that validate and decode
 * untrusted input (form values, route params, API payloads, cached JSON)
 * into the records the core API returns.
 *
 * - `*FromString` decode a P-code, HASC code or name, with the core's lookup
 *   rules; `*FromPcode` accept P-codes only. Both decode to the bundled
 *   record, encode it back to its P-code, and fail with a schema issue that
 *   says what was not found, or which P-codes an ambiguous name matches.
 * - Record schemas (`Region`, `Arrondissement`, `Village`, …) check the
 *   shape of a record, e.g. JSON that left the process and came back.
 *
 * Plain lookups stay in the core: `getRegion(q)` returns `Region | undefined`
 * and `Option.fromUndefinedOr(getRegion(q))` makes it an `Option`. `effect`
 * is an optional peer dependency: only this entry point imports it.
 *
 * @example
 * ```ts
 * import { Schema } from "effect";
 * import { ArrondissementFromString } from "cameroon-locations/effect";
 *
 * const Signup = Schema.Struct({ commune: ArrondissementFromString });
 * Schema.decodeUnknownSync(Signup)({ commune: "Yaoundé 1er" }).commune.pcode;
 * // "CM002007001"
 * ```
 *
 * @module
 */
import { Schema } from "effect";
import { isPcode, PCODE, PCODE_LENGTH } from "./data/scope";
import { bundled, lookupSchema } from "./effect-lookup";
import * as core from "./lookup";
import type * as T from "./types";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * Any OCHA P-code: `CM001` (region), `CM001001` (division) or `CM001001001`
 * (arrondissement). Upper case, no surrounding whitespace.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Pcode)("CM004"); // "CM004"
 * Schema.decodeUnknownSync(Pcode)("CM4"); // throws
 * ```
 */
export const Pcode = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(PCODE, {
      expected: "a P-code such as CM001, CM001001 or CM001001001",
    }),
  ),
);

// One check, so the error names the level ("an arrondissement P-code …").
const levelPcode = (level: T.AdminLevel, expected: string) =>
  Schema.String.pipe(
    Schema.check(
      Schema.makeFilter(
        (s: string) => isPcode(s) && s.length === PCODE_LENGTH[level],
        { expected },
      ),
    ),
  );

/**
 * Region P-code, `CM` followed by 3 digits.
 *
 * @example
 * ```ts
 * Schema.is(RegionPcode)("CM002"); // true
 * Schema.is(RegionPcode)("CM002007"); // false
 * ```
 */
export const RegionPcode = levelPcode(
  "region",
  "a region P-code such as CM002",
);

/**
 * Division P-code, `CM` followed by 6 digits.
 *
 * @example
 * ```ts
 * Schema.is(DivisionPcode)("CM002007"); // true
 * ```
 */
export const DivisionPcode = levelPcode(
  "division",
  "a division P-code such as CM002007",
);

/**
 * Arrondissement P-code, `CM` followed by 9 digits.
 *
 * @example
 * ```ts
 * Schema.is(ArrondissementPcode)("CM002007001"); // true
 * ```
 */
export const ArrondissementPcode = levelPcode(
  "arrondissement",
  "an arrondissement P-code such as CM002007001",
);

/**
 * Canton id, `<arrondissement pcode>-Cnn`.
 *
 * @example
 * ```ts
 * Schema.is(CantonId)("CM002007001-C01"); // true
 * ```
 */
export const CantonId = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^CM\d{9}-C\d{2}$/, {
      expected: "a canton id such as CM002007001-C01",
    }),
  ),
);

/**
 * Village id, `<canton id>-Vnnn`.
 *
 * @example
 * ```ts
 * Schema.is(VillageId)("CM002007001-C01-V001"); // true
 * ```
 */
export const VillageId = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^CM\d{9}-C\d{2}-V\d{3}$/, {
      expected: "a village id such as CM002007001-C01-V001",
    }),
  ),
);

/**
 * Fails, at the path of `child`, unless `record[child]` starts with
 * `record[parent]`: the codes of a record must agree with each other.
 */
function nested<K extends string>(
  pairs: readonly (readonly [child: K, parent: K])[],
) {
  return Schema.makeFilter((record: { readonly [P in K]: string }) => {
    for (const [child, parent] of pairs) {
      if (!record[child].startsWith(record[parent])) {
        return { path: [child], issue: `${child} must start with ${parent}` };
      }
    }
    return undefined;
  });
}

/**
 * `"region" | "division" | "arrondissement"`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(AdminLevel)("region");
 * ```
 */
export const AdminLevel = Schema.Literals([
  "region",
  "division",
  "arrondissement",
]);

/**
 * `"fr" | "en"`.
 *
 * @example
 * ```ts
 * Schema.is(Language)("fr"); // true
 * ```
 */
export const Language = Schema.Literals(["fr", "en"]);

/**
 * Identifier of a data source, see `sources` in the core entry point.
 *
 * @example
 * ```ts
 * Schema.is(SourceId)("ocha-cod-ab-cmr"); // true
 * ```
 */
export const SourceId = Schema.Literals([
  "ocha-cod-ab-cmr",
  "bucrep-rgph2005-repertoire-villages",
  "elecam-polling-stations-2025",
  "geoboundaries-cmr-gbopen",
  "location-script-reference-tables",
  "wikidata",
  "research-2026-10-17",
  "location-script-2025-07",
]);

/**
 * Display names in French and English, both required.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(LocalizedName)({ fr: "Centre", en: "Centre" });
 * ```
 */
export const LocalizedName = Schema.Struct({
  fr: Schema.String,
  en: Schema.String,
});

/**
 * Another spelling of a name, with the sources it was seen in.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Alias)({ name: "Yaounde 1", sources: ["wikidata"] });
 * ```
 */
export const Alias = Schema.Struct({
  name: Schema.String,
  sources: Schema.Array(SourceId),
  lang: Schema.optionalKey(Language),
});

const Count = Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0)));

/**
 * 2005 census population: non-negative integers. `total` is kept as printed,
 * so it is not checked against `male + female`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Population)({ total: 3, male: 1, female: 2 });
 * ```
 */
export const Population = Schema.Struct({
  total: Count,
  male: Count,
  female: Count,
});

/**
 * `[longitude, latitude]` in WGS 84.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(LngLat)([11.5, 3.87]);
 * ```
 */
export const LngLat = Schema.Tuple([Schema.Finite, Schema.Finite]);

/**
 * `[minLng, minLat, maxLng, maxLat]`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(BBox)([11.4, 3.8, 11.6, 3.9]);
 * ```
 */
export const BBox = Schema.Tuple([
  Schema.Finite,
  Schema.Finite,
  Schema.Finite,
  Schema.Finite,
]);

const unitFields = {
  name: LocalizedName,
  refName: Schema.String,
  aliases: Schema.Array(Alias),
  hasc: Schema.optionalKey(Schema.String),
  wikidata: Schema.optionalKey(Schema.String),
  areaSqKm: Schema.Finite,
  centroid: LngLat,
  bbox: BBox,
  population2005: Schema.optionalKey(Population),
  sources: Schema.Array(SourceId),
};

/**
 * A region record (ADM1). Decoding checks the shape, not that the region
 * exists; use {@link RegionFromPcode} for that.
 *
 * @example
 * ```ts
 * import { Schema } from "effect";
 * import { regions } from "cameroon-locations";
 *
 * const json = JSON.parse(JSON.stringify(regions[0]));
 * Schema.decodeUnknownSync(Region)(json).pcode; // "CM001"
 * ```
 */
export const Region = Schema.Struct({
  pcode: RegionPcode,
  level: Schema.Literal("region"),
  ...unitFields,
  parentPcode: Schema.Null,
});

/**
 * A division record (ADM2, département).
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Division)(payload).regionPcode;
 * ```
 */
export const Division = Schema.Struct({
  pcode: DivisionPcode,
  level: Schema.Literal("division"),
  ...unitFields,
  parentPcode: RegionPcode,
  regionPcode: RegionPcode,
}).check(
  nested([
    ["pcode", "parentPcode"],
    ["parentPcode", "regionPcode"],
    ["regionPcode", "parentPcode"],
  ]),
);

/**
 * An arrondissement record (ADM3, subdivision).
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Arrondissement)(payload).divisionPcode;
 * ```
 */
export const Arrondissement = Schema.Struct({
  pcode: ArrondissementPcode,
  level: Schema.Literal("arrondissement"),
  ...unitFields,
  parentPcode: DivisionPcode,
  regionPcode: RegionPcode,
  divisionPcode: DivisionPcode,
  ordinal: Schema.optionalKey(Schema.Int),
}).check(
  nested([
    ["pcode", "parentPcode"],
    ["parentPcode", "divisionPcode"],
    ["divisionPcode", "parentPcode"],
    ["divisionPcode", "regionPcode"],
  ]),
);

/**
 * Any administrative unit, discriminated by `level`. Comes with the tagged
 * union helpers `AdminUnit.guards` and `AdminUnit.match`.
 *
 * @example
 * ```ts
 * const unit = Schema.decodeUnknownSync(AdminUnit)(payload);
 * AdminUnit.match(unit, {
 *   region: (r) => r.name.en,
 *   division: (d) => d.regionPcode,
 *   arrondissement: (a) => a.divisionPcode,
 * });
 * ```
 */
export const AdminUnit = Schema.Union([Region, Division, Arrondissement]).pipe(
  Schema.toTaggedUnion("level"),
);

/**
 * A canton as printed by BUCREP. `id` is `<arrondissement pcode>-Cnn`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Canton)(payload).arrondissementPcode;
 * ```
 */
export const Canton = Schema.Struct({
  id: CantonId,
  arrondissementPcode: ArrondissementPcode,
  name: Schema.String,
  label: Schema.String,
  population2005: Schema.optionalKey(Population),
  sources: Schema.Array(SourceId),
}).check(nested([["id", "arrondissementPcode"]]));

/**
 * A quartier or village as printed by BUCREP. `id` is `<canton id>-Vnnn`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Village)(payload).cantonId;
 * ```
 */
export const Village = Schema.Struct({
  id: VillageId,
  cantonId: CantonId,
  arrondissementPcode: ArrondissementPcode,
  name: Schema.String,
  label: Schema.String,
  population2005: Schema.optionalKey(Population),
  sources: Schema.Array(SourceId),
}).check(
  nested([
    ["id", "cantonId"],
    ["cantonId", "arrondissementPcode"],
  ]),
);

/**
 * One ELECAM polling station. `arrondissementPcode` is `null` abroad.
 *
 * @example
 * ```ts
 * import { pollingStations } from "cameroon-locations/elecam";
 *
 * Schema.is(PollingStation)(pollingStations[0]); // true
 * ```
 */
export const PollingStation = Schema.Struct({
  arrondissementPcode: Schema.NullOr(ArrondissementPcode),
  council: Schema.String,
  centre: Schema.String,
  station: Schema.String,
  registeredVoters: Count,
  sources: Schema.Array(SourceId),
});

/**
 * ELECAM totals for one arrondissement's council.
 *
 * @example
 * ```ts
 * import { getCouncilSummary } from "cameroon-locations/elecam";
 *
 * Schema.is(CouncilElectoralSummary)(getCouncilSummary("CM002007001")); // true
 * ```
 */
export const CouncilElectoralSummary = Schema.Struct({
  arrondissementPcode: ArrondissementPcode,
  council: Schema.String,
  registeredVoters: Count,
  pollingCentres: Count,
  pollingStations: Count,
  sources: Schema.Array(SourceId),
});

/**
 * A data source: licence, online URL, archived copy and attribution.
 *
 * @example
 * ```ts
 * import { sources } from "cameroon-locations";
 *
 * Schema.is(SourceInfo)(sources.wikidata); // true
 * ```
 */
export const SourceInfo = Schema.Struct({
  id: SourceId,
  title: Schema.String,
  publisher: Schema.String,
  license: Schema.String,
  licenseUrl: Schema.optionalKey(Schema.String),
  url: Schema.String,
  repositoryUrl: Schema.String,
  retrieved: Schema.String,
  attribution: Schema.String,
});

/**
 * Name, version and sources of the bundled dataset (`metadata`).
 *
 * @example
 * ```ts
 * import { metadata } from "cameroon-locations";
 *
 * Schema.decodeUnknownSync(DatasetMetadata)(metadata).version;
 * ```
 */
export const DatasetMetadata = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  generated: Schema.String,
  repository: Schema.String,
  sources: Schema.Array(SourceInfo),
});

// ---------------------------------------------------------------------------
// Input → bundled record
// ---------------------------------------------------------------------------

type UnitAt<L extends T.AdminLevel> = Extract<T.AdminUnit, { level: L }>;

const records: { readonly [L in T.AdminLevel]: Schema.declare<UnitAt<L>> } = {
  region: bundled<T.Region>(Region, "Region"),
  division: bundled<T.Division>(Division, "Division"),
  arrondissement: bundled<T.Arrondissement>(Arrondissement, "Arrondissement"),
};

const fromPcode = <L extends T.AdminLevel>(
  from: Schema.Codec<string>,
  level: L,
) =>
  lookupSchema(
    from,
    records[level],
    level,
    (pcode) => {
      const unit = core.getUnit(pcode);
      return unit?.level === level ? [unit as UnitAt<L>] : [];
    },
    (pcode) => `Unknown ${level} P-code "${pcode}"`,
  );

const fromString = <L extends T.AdminLevel>(level: L) =>
  lookupSchema(
    Schema.String,
    records[level],
    level,
    (query) => core.find(query, { level }) as readonly UnitAt<L>[],
    (query) => `No ${level} matches "${query}"`,
  );

/**
 * Decodes a region P-code, HASC code or name (French or English, any case
 * or accents: the core's `LocationQuery`) into its {@link Region} record,
 * and encodes the record back to its P-code.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(RegionFromString)("littoral").pcode; // "CM005"
 * ```
 */
export const RegionFromString = fromString("region");

/**
 * Like {@link RegionFromString}, for divisions.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(DivisionFromString)("Mfoundi").pcode; // "CM002007"
 * ```
 */
export const DivisionFromString = fromString("division");

/**
 * Like {@link RegionFromString}, for arrondissements: use it for free-text
 * input. A name shared by several arrondissements fails and lists their
 * P-codes (no name is shared in the current data, but aliases may collide
 * as sources are added).
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(ArrondissementFromString)("Yaoundé 1er").pcode;
 * // "CM002007001"
 * Schema.decodeUnknownSync(ArrondissementFromString)("nowhere");
 * // throws: No arrondissement matches "nowhere"
 * ```
 */
export const ArrondissementFromString = fromString("arrondissement");

/**
 * Decodes a region P-code into its {@link Region} record and encodes the
 * record back to the P-code. Fails on malformed or unknown P-codes.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(RegionFromPcode)("CM002").name.en; // "Centre"
 * ```
 */
export const RegionFromPcode = fromPcode(RegionPcode, "region");

/**
 * Decodes a division P-code into its {@link Division} record.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(DivisionFromPcode)("CM002007").name.fr; // "Mfoundi"
 * ```
 */
export const DivisionFromPcode = fromPcode(DivisionPcode, "division");

/**
 * Decodes an arrondissement P-code into its {@link Arrondissement} record:
 * use it where the input must already be a code, such as a `<select>` value,
 * a route param or a stored id.
 *
 * @example
 * ```ts
 * const Params = Schema.Struct({ commune: ArrondissementFromPcode });
 * Schema.decodeUnknownSync(Params)({ commune: "CM002007001" }).commune.name.fr;
 * // "Yaoundé I"
 * ```
 */
export const ArrondissementFromPcode = fromPcode(
  ArrondissementPcode,
  "arrondissement",
);

/**
 * Decodes a P-code of any level into its {@link AdminUnit} record.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(AdminUnitFromPcode)("CM002007").level; // "division"
 * ```
 */
export const AdminUnitFromPcode = lookupSchema(
  Pcode,
  bundled<T.AdminUnit>(AdminUnit, "AdminUnit"),
  "unit",
  (pcode) => {
    const unit = core.getUnit(pcode);
    return unit ? [unit] : [];
  },
  (pcode) => `Unknown P-code "${pcode}"`,
);
