/**
 * Compile-time check, run by `bun run typecheck`: every schema of
 * `cameroon-locations/effect` decodes to exactly the core type of
 * `src/types.ts`, and encodes to it (record schemas) or to a P-code string
 * (`*From*` schemas). "Exactly" is both ways, readonly modifiers and optional
 * keys included, so a field added to, removed from or changed in either side
 * fails the build.
 */
import type * as E from "../src/effect";
import type * as T from "../src/types";

/** True when `A` and `B` are identical, readonly and optional keys included. */
type Equals<A, B> =
  (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2
    ? true
    : false;
type Assert<_ extends true> = never;
type Schema = { readonly Type: unknown; readonly Encoded: unknown };

/** Decodes `A` into `A`. */
type Codec<S extends Schema, A> =
  Equals<S["Type"], A> extends true ? Equals<S["Encoded"], A> : false;
/** Decodes a `string` into `A`. */
type FromString<S extends Schema, A> =
  Equals<S["Type"], A> extends true ? Equals<S["Encoded"], string> : false;

export type Checks = [
  Assert<Codec<typeof E.Pcode, T.Pcode>>,
  Assert<Codec<typeof E.RegionPcode, T.Pcode>>,
  Assert<Codec<typeof E.DivisionPcode, T.Pcode>>,
  Assert<Codec<typeof E.ArrondissementPcode, T.Pcode>>,
  Assert<Codec<typeof E.CantonId, T.Canton["id"]>>,
  Assert<Codec<typeof E.VillageId, T.Village["id"]>>,
  Assert<Codec<typeof E.AdminLevel, T.AdminLevel>>,
  Assert<Codec<typeof E.Language, T.Language>>,
  Assert<Codec<typeof E.SourceId, T.SourceId>>,
  Assert<Codec<typeof E.LocalizedName, T.LocalizedName>>,
  Assert<Codec<typeof E.Alias, T.Alias>>,
  Assert<Codec<typeof E.Population, T.Population>>,
  Assert<Codec<typeof E.LngLat, T.LngLat>>,
  Assert<Codec<typeof E.BBox, T.BBox>>,
  Assert<Codec<typeof E.Region, T.Region>>,
  Assert<Codec<typeof E.Division, T.Division>>,
  Assert<Codec<typeof E.Arrondissement, T.Arrondissement>>,
  Assert<Codec<typeof E.AdminUnit, T.AdminUnit>>,
  Assert<Codec<typeof E.Canton, T.Canton>>,
  Assert<Codec<typeof E.Village, T.Village>>,
  Assert<Codec<typeof E.PollingStation, T.PollingStation>>,
  Assert<Codec<typeof E.CouncilElectoralSummary, T.CouncilElectoralSummary>>,
  Assert<Codec<typeof E.SourceInfo, T.SourceInfo>>,
  Assert<Codec<typeof E.DatasetMetadata, T.DatasetMetadata>>,
  Assert<FromString<typeof E.RegionFromPcode, T.Region>>,
  Assert<FromString<typeof E.DivisionFromPcode, T.Division>>,
  Assert<FromString<typeof E.ArrondissementFromPcode, T.Arrondissement>>,
  Assert<FromString<typeof E.AdminUnitFromPcode, T.AdminUnit>>,
  Assert<FromString<typeof E.RegionFromString, T.Region>>,
  Assert<FromString<typeof E.DivisionFromString, T.Division>>,
  Assert<FromString<typeof E.ArrondissementFromString, T.Arrondissement>>,
];
