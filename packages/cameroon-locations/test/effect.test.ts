import { describe, expect, test } from "bun:test";
import { Effect, Exit, Option, Schema } from "effect";
import { cantons } from "../src/cantons";
import { arrondissements, divisions, regions } from "../src/data/admin";
import { metadata } from "../src/data/metadata";
import {
  AdminUnit,
  Arrondissement,
  ArrondissementFromPcode,
  CameroonLocations,
  Canton,
  CouncilElectoralSummary,
  DatasetMetadata,
  Division,
  getArrondissement,
  getArrondissementOption,
  getRegion,
  LocationNotFound,
  Pcode,
  PollingStation,
  Region,
  SourceInfo,
  Village,
} from "../src/effect";
import { councilSummaries, pollingStations } from "../src/elecam";
import { sources } from "../src/sources";
import { villages } from "../src/villages";

const yaounde1 = arrondissements.find((a) => a.pcode === "CM002007001");

describe("schemas", () => {
  test("every shipped unit round-trips through JSON and AdminUnit", () => {
    const decode = Schema.decodeUnknownSync(AdminUnit);
    const encode = Schema.encodeSync(AdminUnit);
    for (const unit of [...regions, ...divisions, ...arrondissements]) {
      const json = JSON.parse(JSON.stringify(unit));
      expect(decode(json)).toEqual(unit);
      expect(encode(unit)).toEqual(json);
    }
  });

  test("a level-specific schema rejects another level", () => {
    expect(Schema.is(Region)(regions[0])).toBe(true);
    expect(Schema.is(Region)(divisions[0])).toBe(false);
    expect(Schema.is(Arrondissement)({ ...yaounde1, pcode: "CM002" })).toBe(
      false,
    );
  });

  test("records with inconsistent codes fail to decode", () => {
    const division = divisions[0];
    expect(Schema.is(Division)(division)).toBe(true);
    for (const bad of [
      { ...division, parentPcode: "CM009", regionPcode: "CM009" },
      { ...division, regionPcode: "CM009" },
      { ...yaounde1, divisionPcode: "CM002008" },
      { ...yaounde1, regionPcode: "CM001" },
    ]) {
      expect(Schema.is(AdminUnit)(bad)).toBe(false);
    }
    const canton = cantons[0];
    expect(Schema.is(Canton)(canton)).toBe(true);
    expect(
      Schema.is(Canton)({ ...canton, arrondissementPcode: "CM009001001" }),
    ).toBe(false);
    const village = villages[0];
    expect(Schema.is(Village)(village)).toBe(true);
    expect(
      Schema.is(Village)({ ...village, cantonId: "CM001001001-C99" }),
    ).toBe(false);
    expect(Schema.is(Village)({ ...village, cantonId: "x" })).toBe(false);
  });

  test("ELECAM records, sources and metadata have schemas", () => {
    expect(pollingStations.every(Schema.is(PollingStation))).toBe(true);
    expect(councilSummaries.every(Schema.is(CouncilElectoralSummary))).toBe(
      true,
    );
    expect(Object.values(sources).every(Schema.is(SourceInfo))).toBe(true);
    const json = JSON.parse(JSON.stringify(metadata));
    expect(Schema.decodeUnknownSync(DatasetMetadata)(json)).toEqual(metadata);
  });

  test("bad P-codes fail to decode", () => {
    const decode = Schema.decodeUnknownSync(Pcode);
    expect(decode("CM002007001")).toBe("CM002007001");
    for (const bad of ["CM4", "cm002", "CM0020", "CM002007001x", " CM002", 2]) {
      expect(() => decode(bad)).toThrow();
    }
  });

  test("ArrondissementFromPcode decodes to the record and encodes back", () => {
    const decoded = Schema.decodeUnknownSync(ArrondissementFromPcode)(
      "CM002007001",
    );
    expect(decoded).toEqual(yaounde1 as typeof decoded);
    expect(decoded.name.fr).toBe("Yaoundé I");
    expect(Schema.encodeSync(ArrondissementFromPcode)(decoded)).toBe(
      "CM002007001",
    );
  });

  test("ArrondissementFromPcode names the unknown P-code", () => {
    const result = Schema.decodeUnknownExit(ArrondissementFromPcode)(
      "CM002007999",
    );
    expect(Exit.isFailure(result)).toBe(true);
    expect(String(result)).toContain(
      'Unknown arrondissement P-code "CM002007999"',
    );
  });
});

describe("lookups", () => {
  test("succeed with the core record", () => {
    expect(Effect.runSync(getRegion("Centre")).pcode).toBe("CM002");
    expect(Effect.runSync(getArrondissement("Yaoundé 1er"))).toBe(
      yaounde1 as never,
    );
  });

  test("unknown names fail with LocationNotFound", () => {
    const error = Effect.runSync(Effect.flip(getArrondissement("nowhere")));
    expect(error).toBeInstanceOf(LocationNotFound);
    expect(error._tag).toBe("LocationNotFound");
    expect(error).toMatchObject({ query: "nowhere", level: "arrondissement" });
    expect(error.message).toBe('No arrondissement matches "nowhere"');
  });

  test("`within` scopes the search", () => {
    const exit = Effect.runSyncExit(
      getArrondissement("Yaoundé I", { within: "CM005" }),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    // An explicit `undefined` is accepted under exactOptionalPropertyTypes.
    expect(
      Effect.runSync(getArrondissement("Yaoundé I", { within: undefined }))
        .pcode,
    ).toBe("CM002007001");
  });

  test("Option variants return None when nothing matches", () => {
    expect(Option.isNone(getArrondissementOption("nowhere"))).toBe(true);
    expect(getArrondissementOption("CM002007001")).toEqual(
      Option.some(yaounde1 as never),
    );
  });
});

describe("CameroonLocations service", () => {
  const program = Effect.gen(function* () {
    const locations = yield* CameroonLocations;
    return yield* locations.getUnit("CM002");
  });

  test("the default layer serves the bundled data", () => {
    const unit = Effect.runSync(
      program.pipe(Effect.provide(CameroonLocations.layer)),
    );
    expect(unit.pcode).toBe("CM002");
  });
});
