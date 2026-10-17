import { describe, expect, test } from "bun:test";
import { Exit, Schema } from "effect";
import { cantons } from "../src/cantons";
import { arrondissements, divisions, regions } from "../src/data/admin";
import { metadata } from "../src/data/metadata";
import {
  AdminUnit,
  AdminUnitFromPcode,
  Arrondissement,
  ArrondissementFromPcode,
  ArrondissementFromString,
  Canton,
  CouncilElectoralSummary,
  DatasetMetadata,
  Division,
  DivisionFromString,
  Pcode,
  PollingStation,
  Region,
  RegionFromPcode,
  RegionFromString,
  SourceInfo,
  Village,
} from "../src/effect";
import { bundled, lookupSchema } from "../src/effect-lookup";
import { councilSummaries, pollingStations } from "../src/elecam";
import { getArrondissement } from "../src/lookup";
import { sources } from "../src/sources";
import { villages } from "../src/villages";

const yaounde1 = getArrondissement("CM002007001");

/** The formatted error of a failed decode, or `undefined` if it succeeded. */
function failure(schema: Schema.Decoder<unknown>, input: unknown) {
  const exit = Schema.decodeUnknownExit(schema)(input);
  return Exit.isFailure(exit) ? String(exit.cause) : undefined;
}

describe("record schemas", () => {
  test("every bundled unit round-trips through JSON with its schema", () => {
    const schemas = { region: Region, division: Division };
    for (const unit of [...regions, ...divisions, ...arrondissements]) {
      const json = JSON.parse(JSON.stringify(unit));
      expect(Schema.decodeUnknownSync(AdminUnit)(json)).toEqual(unit);
      expect(Schema.encodeSync(AdminUnit)(unit)).toEqual(json);
      const own =
        unit.level === "arrondissement" ? Arrondissement : schemas[unit.level];
      expect(Schema.is(own)(json)).toBe(true);
    }
  });

  test("every canton, village, ELECAM record and source validates", () => {
    expect(cantons.every(Schema.is(Canton))).toBe(true);
    expect(villages.every(Schema.is(Village))).toBe(true);
    expect(pollingStations.every(Schema.is(PollingStation))).toBe(true);
    expect(councilSummaries.every(Schema.is(CouncilElectoralSummary))).toBe(
      true,
    );
    expect(Object.values(sources).every(Schema.is(SourceInfo))).toBe(true);
    const json = JSON.parse(JSON.stringify(metadata));
    expect(Schema.decodeUnknownSync(DatasetMetadata)(json)).toEqual(metadata);
  });

  test("a level-specific schema rejects another level", () => {
    expect(Schema.is(Region)(divisions[0])).toBe(false);
    expect(Schema.is(Arrondissement)({ ...yaounde1, pcode: "CM002" })).toBe(
      false,
    );
  });

  test("records whose codes disagree fail, at the offending key", () => {
    const division = divisions[0];
    for (const bad of [
      { ...division, parentPcode: "CM009", regionPcode: "CM009" },
      { ...division, regionPcode: "CM009" },
      { ...yaounde1, divisionPcode: "CM002008" },
      { ...yaounde1, regionPcode: "CM001" },
    ]) {
      expect(Schema.is(AdminUnit)(bad)).toBe(false);
    }
    expect(
      failure(Canton, { ...cantons[0], arrondissementPcode: "CM009001001" }),
    ).toContain('at ["id"]');
    expect(
      Schema.is(Village)({ ...villages[0], cantonId: "CM001001001-C99" }),
    ).toBe(false);
  });

  test("malformed P-codes fail", () => {
    const decode = Schema.decodeUnknownSync(Pcode);
    expect(decode("CM002007001")).toBe("CM002007001");
    for (const bad of ["CM4", "cm002", "CM0020", "CM002007001x", " CM002", 2]) {
      expect(() => decode(bad)).toThrow();
    }
  });
});

describe("*FromPcode", () => {
  test("decode to the bundled record and encode back to the P-code", () => {
    const decoded = Schema.decodeUnknownSync(ArrondissementFromPcode)(
      "CM002007001",
    );
    expect(decoded).toBe(yaounde1 as typeof decoded);
    expect(Object.isFrozen(decoded)).toBe(true);
    expect(Schema.encodeSync(ArrondissementFromPcode)(decoded)).toBe(
      "CM002007001",
    );
    expect(Schema.decodeUnknownSync(AdminUnitFromPcode)("CM002007").level).toBe(
      "division",
    );
  });

  test("encoding accepts a structurally equal copy", () => {
    const copy = JSON.parse(JSON.stringify(yaounde1));
    expect(Schema.encodeUnknownSync(ArrondissementFromPcode)(copy)).toBe(
      "CM002007001",
    );
  });

  test("unknown, malformed and other-level P-codes fail with a message", () => {
    expect(failure(ArrondissementFromPcode, "CM002007999")).toContain(
      'Unknown arrondissement P-code "CM002007999"',
    );
    expect(failure(ArrondissementFromPcode, "Yaoundé I")).toContain(
      "Expected an arrondissement P-code such as CM002007001",
    );
    expect(failure(RegionFromPcode, "CM002007")).toContain(
      "Expected a region P-code such as CM002",
    );
    expect(failure(AdminUnitFromPcode, "CM999")).toContain(
      'Unknown P-code "CM999"',
    );
    expect(failure(RegionFromPcode, 2)).toContain("Expected string");
  });

  test("a failure inside a struct names the field", () => {
    const Form = Schema.Struct({ commune: ArrondissementFromPcode });
    expect(failure(Form, { commune: "CM002007999" })).toContain(
      'at ["commune"]',
    );
  });
});

describe("*FromString", () => {
  test("decode a P-code, HASC code or name with the core's rules", () => {
    const decode = Schema.decodeUnknownSync(ArrondissementFromString);
    for (const query of ["CM002007001", "yaounde 1er", " Yaoundé I "]) {
      expect(decode(query)).toBe(yaounde1 as never);
    }
    expect(Schema.decodeUnknownSync(RegionFromString)("littoral").pcode).toBe(
      "CM005",
    );
    const mfoundi = Schema.decodeUnknownSync(DivisionFromString)("Mfoundi");
    expect(Schema.encodeSync(DivisionFromString)(mfoundi)).toBe("CM002007");
  });

  test("unknown input and other levels fail with a message", () => {
    expect(failure(ArrondissementFromString, "nowhere")).toContain(
      'No arrondissement matches "nowhere"',
    );
    expect(failure(RegionFromString, "Mfoundi")).toContain(
      'No region matches "Mfoundi"',
    );
    expect(failure(RegionFromString, null)).toContain("Expected string");
  });

  test("an ambiguous name fails and lists the candidate P-codes", () => {
    // No name is shared in the current data, so fake a lookup that is.
    const twins = arrondissements.slice(0, 2);
    const schema = lookupSchema(
      Schema.String,
      bundled<(typeof twins)[number]>(Arrondissement, "Arrondissement"),
      "arrondissement",
      () => twins,
      () => "unreachable",
    );
    expect(failure(schema, "Twin")).toContain(
      `"Twin" matches 2 arrondissements: ${twins[0]?.pcode}, ${twins[1]?.pcode}`,
    );
  });
});
