/**
 * `cameroon-locations/effect`: an Effect v4 adapter over the core API.
 *
 * - Schemas for every record, to validate and decode untrusted input.
 * - `*FromPcode` schemas that decode a P-code string into the record.
 * - Lookups returning `Effect<T, LocationNotFound | AmbiguousLocation>`, and
 *   `*Option` variants returning `Option<T>`.
 * - A {@link CameroonLocations} service with a default layer, for DI.
 *
 * `effect` is an optional peer dependency: only this entry point imports it.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { getArrondissement } from "cameroon-locations/effect";
 *
 * const program = getArrondissement("Yaoundé I").pipe(
 *   Effect.map((a) => a.pcode),
 *   Effect.catchTag("LocationNotFound", () => Effect.succeed("unknown")),
 * );
 * Effect.runSync(program); // "CM002007001"
 * ```
 *
 * @module
 */
import {
  Context,
  Effect,
  Layer,
  Option,
  Schema,
  SchemaGetter,
  SchemaIssue,
} from "effect";
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
    Schema.isPattern(/^CM\d{3}(?:\d{3}(?:\d{3})?)?$/, {
      expected: "a P-code such as CM001, CM001001 or CM001001001",
    }),
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
export const RegionPcode = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^CM\d{3}$/, {
      expected: "a region P-code such as CM002",
    }),
  ),
);

/**
 * Division P-code, `CM` followed by 6 digits.
 *
 * @example
 * ```ts
 * Schema.is(DivisionPcode)("CM002007"); // true
 * ```
 */
export const DivisionPcode = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^CM\d{6}$/, {
      expected: "a division P-code such as CM002007",
    }),
  ),
);

/**
 * Arrondissement P-code, `CM` followed by 9 digits.
 *
 * @example
 * ```ts
 * Schema.is(ArrondissementPcode)("CM002007001"); // true
 * ```
 */
export const ArrondissementPcode = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^CM\d{9}$/, {
      expected: "an arrondissement P-code such as CM002007001",
    }),
  ),
);

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
  "cameroon-locations-0.1.0-july-2025",
]) satisfies Schema.Codec<T.SourceId>;

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
}) satisfies Schema.Codec<T.LocalizedName>;

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
}) satisfies Schema.Codec<T.Alias>;

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
}) satisfies Schema.Codec<T.Population>;

/**
 * `[longitude, latitude]` in WGS 84.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(LngLat)([11.5, 3.87]);
 * ```
 */
export const LngLat = Schema.Tuple([
  Schema.Finite,
  Schema.Finite,
]) satisfies Schema.Codec<T.LngLat>;

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
]) satisfies Schema.Codec<T.BBox>;

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
}) satisfies Schema.Codec<T.Region>;

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
}) satisfies Schema.Codec<T.Division>;

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
}) satisfies Schema.Codec<T.Arrondissement>;

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
) satisfies Schema.Codec<T.AdminUnit>;

/**
 * A canton as printed by BUCREP. `id` is `<arrondissement pcode>-Cnn`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Canton)(payload).arrondissementPcode;
 * ```
 */
export const Canton = Schema.Struct({
  id: Schema.String.pipe(
    Schema.check(
      Schema.isPattern(/^CM\d{9}-C\d{2}$/, {
        expected: "a canton id such as CM002007001-C01",
      }),
    ),
  ),
  arrondissementPcode: ArrondissementPcode,
  name: Schema.String,
  label: Schema.String,
  population2005: Schema.optionalKey(Population),
  sources: Schema.Array(SourceId),
}) satisfies Schema.Codec<T.Canton>;

/**
 * A quartier or village as printed by BUCREP. `id` is `<canton id>-Vnnn`.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(Village)(payload).cantonId;
 * ```
 */
export const Village = Schema.Struct({
  id: Schema.String.pipe(
    Schema.check(
      Schema.isPattern(/^CM\d{9}-C\d{2}-V\d{3}$/, {
        expected: "a village id such as CM002007001-C01-V001",
      }),
    ),
  ),
  cantonId: Schema.String,
  arrondissementPcode: ArrondissementPcode,
  name: Schema.String,
  label: Schema.String,
  population2005: Schema.optionalKey(Population),
  sources: Schema.Array(SourceId),
}) satisfies Schema.Codec<T.Village>;

// ---------------------------------------------------------------------------
// P-code → record
// ---------------------------------------------------------------------------

function fromPcode<From extends Schema.Codec<string>, To extends Schema.Top>(
  from: From,
  to: To,
  level: T.AdminLevel | undefined,
) {
  const what = level ?? "unit";
  return from.pipe(
    Schema.decodeTo(to, {
      decode: SchemaGetter.transformEffect((pcode: string) => {
        const unit = core.getUnit(pcode);
        return unit && (!level || unit.level === level)
          ? Effect.succeed(unit as To["Encoded"])
          : Effect.fail(
              new SchemaIssue.InvalidValue(
                { message: `Unknown ${what} P-code "${pcode}"` },
                pcode,
              ),
            );
      }),
      encode: SchemaGetter.transform(
        (unit: To["Encoded"]) => (unit as T.AdminUnit).pcode,
      ),
    }),
  );
}

/**
 * Decodes a region P-code into the {@link Region} record and encodes it back
 * to its P-code. Fails on unknown P-codes.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(RegionFromPcode)("CM002").name.en; // "Centre"
 * ```
 */
export const RegionFromPcode = fromPcode(RegionPcode, Region, "region");

/**
 * Decodes a division P-code into the {@link Division} record.
 *
 * @example
 * ```ts
 * Schema.decodeUnknownSync(DivisionFromPcode)("CM002007").name.fr; // "Mfoundi"
 * ```
 */
export const DivisionFromPcode = fromPcode(DivisionPcode, Division, "division");

/**
 * Decodes an arrondissement P-code into the {@link Arrondissement} record.
 * Handy for form values and route params.
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
  Arrondissement,
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
export const AdminUnitFromPcode = fromPcode(Pcode, AdminUnit, undefined);

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * No unit matches `query` at `level`. `level` is absent for {@link getUnit},
 * which accepts every level.
 *
 * @example
 * ```ts
 * getRegion("Atlantis").pipe(
 *   Effect.catchTag("LocationNotFound", (e) => Effect.succeed(e.query)),
 * );
 * ```
 */
export class LocationNotFound extends Schema.TaggedError<LocationNotFound>()(
  "LocationNotFound",
  {
    query: Schema.String,
    level: Schema.optionalKey(AdminLevel),
  },
) {
  override get message(): string {
    return `No ${this.level ?? "unit"} matches "${this.query}"`;
  }
}

/**
 * Several units at `level` carry the name `query`. `candidates` lists their
 * P-codes; retry with one of them, or narrow with `within`. No name in the
 * current dataset is shared within a level, but aliases may collide as
 * sources are added.
 *
 * @example
 * ```ts
 * getArrondissement(input, { within: divisionPcode }).pipe(
 *   Effect.catchTag("AmbiguousLocation", (e) =>
 *     Effect.logWarning(`pick one of ${e.candidates.join(", ")}`),
 *   ),
 * );
 * ```
 */
export class AmbiguousLocation extends Schema.TaggedError<AmbiguousLocation>()(
  "AmbiguousLocation",
  {
    query: Schema.String,
    level: AdminLevel,
    candidates: Schema.Array(Pcode),
  },
) {
  override get message(): string {
    return `"${this.query}" matches ${this.candidates.length} ${this.level}s: ${this.candidates.join(", ")}`;
  }
}

/** Errors raised by the name-based lookups. */
export type LookupError = LocationNotFound | AmbiguousLocation;

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

type Within = { readonly within?: T.Pcode };

function lookup<A extends T.AdminUnit>(
  query: core.LocationQuery,
  level: A["level"],
  unit: A | undefined,
  within?: T.Pcode,
): Effect.Effect<A, LookupError> {
  if (unit) return Effect.succeed(unit);
  const matches = core.find(query, within ? { level, within } : { level });
  return Effect.fail(
    matches.length > 1
      ? new AmbiguousLocation({
          query,
          level,
          candidates: matches.map((m) => m.pcode),
        })
      : new LocationNotFound({ query, level }),
  );
}

/**
 * Region by P-code, HASC code or name (French or English, any case or
 * accents). Fails with {@link LocationNotFound} or {@link AmbiguousLocation}.
 *
 * @example
 * ```ts
 * Effect.runSync(getRegion("Littoral")).pcode; // "CM005"
 * ```
 */
export const getRegion = (
  query: core.LocationQuery,
): Effect.Effect<T.Region, LookupError> =>
  lookup(query, "region", core.getRegion(query));

/**
 * Division by P-code, HASC code or name, optionally `within` a region.
 *
 * @example
 * ```ts
 * Effect.runSync(getDivision("Mfoundi")).pcode; // "CM002007"
 * ```
 */
export const getDivision = (
  query: core.LocationQuery,
  options?: Within,
): Effect.Effect<T.Division, LookupError> =>
  lookup(query, "division", core.getDivision(query, options), options?.within);

/**
 * Arrondissement by P-code, HASC code or name, optionally `within` a region
 * or division. Names shared by several arrondissements fail with
 * {@link AmbiguousLocation}.
 *
 * @example
 * ```ts
 * Effect.runSync(getArrondissement("Yaoundé 1er")).pcode; // "CM002007001"
 * ```
 */
export const getArrondissement = (
  query: core.LocationQuery,
  options?: Within,
): Effect.Effect<T.Arrondissement, LookupError> =>
  lookup(
    query,
    "arrondissement",
    core.getArrondissement(query, options),
    options?.within,
  );

/**
 * Unit of any level, by P-code only. Fails with {@link LocationNotFound}.
 *
 * @example
 * ```ts
 * Effect.runSync(getUnit("CM002007")).level; // "division"
 * ```
 */
export const getUnit = (
  pcode: T.Pcode,
): Effect.Effect<T.AdminUnit, LocationNotFound> => {
  const unit = core.getUnit(pcode);
  return unit
    ? Effect.succeed(unit)
    : Effect.fail(new LocationNotFound({ query: pcode }));
};

/**
 * Like {@link getRegion}, as an `Option`: `None` when nothing matches or the
 * name is ambiguous. The `*Option` suffix follows Effect's own naming
 * (`Schema.decodeUnknownOption`, `Context.getOption`).
 *
 * @example
 * ```ts
 * Option.map(getRegionOption("Centre"), (r) => r.pcode); // Some("CM002")
 * ```
 */
export const getRegionOption = (
  query: core.LocationQuery,
): Option.Option<T.Region> => Option.fromUndefinedOr(core.getRegion(query));

/**
 * Like {@link getDivision}, as an `Option`.
 *
 * @example
 * ```ts
 * getDivisionOption("Mfoundi"); // Some(Division)
 * ```
 */
export const getDivisionOption = (
  query: core.LocationQuery,
  options?: Within,
): Option.Option<T.Division> =>
  Option.fromUndefinedOr(core.getDivision(query, options));

/**
 * Like {@link getArrondissement}, as an `Option`.
 *
 * @example
 * ```ts
 * getArrondissementOption("nowhere"); // None
 * ```
 */
export const getArrondissementOption = (
  query: core.LocationQuery,
  options?: Within,
): Option.Option<T.Arrondissement> =>
  Option.fromUndefinedOr(core.getArrondissement(query, options));

/**
 * Like {@link getUnit}, as an `Option`.
 *
 * @example
 * ```ts
 * getUnitOption("CM999"); // None
 * ```
 */
export const getUnitOption = (pcode: T.Pcode): Option.Option<T.AdminUnit> =>
  Option.fromUndefinedOr(core.getUnit(pcode));

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * The lookups as a service, so code can depend on them through the context
 * and tests can swap in a stub. `CameroonLocations.layer` provides the
 * bundled dataset.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const locations = yield* CameroonLocations;
 *   return yield* locations.getArrondissement("Yaoundé I");
 * });
 * Effect.runSync(program.pipe(Effect.provide(CameroonLocations.layer)));
 * ```
 */
export class CameroonLocations extends Context.Service<
  CameroonLocations,
  {
    readonly getRegion: typeof getRegion;
    readonly getDivision: typeof getDivision;
    readonly getArrondissement: typeof getArrondissement;
    readonly getUnit: typeof getUnit;
  }
>()("cameroon-locations/CameroonLocations") {
  /** Layer backed by the dataset bundled with the package. */
  static readonly layer: Layer.Layer<CameroonLocations> = Layer.succeed(
    CameroonLocations,
    CameroonLocations.of({
      getRegion,
      getDivision,
      getArrondissement,
      getUnit,
    }),
  );
}
