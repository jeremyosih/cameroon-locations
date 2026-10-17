import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect, Exit, Layer, Option, Schema } from "effect";
import {
  AdminUnit,
  Arrondissement,
  ArrondissementFromPcode,
  CameroonLocations,
  getArrondissement,
  getArrondissementOption,
  getRegion,
  getUnit,
  LocationNotFound,
  Pcode,
  Region,
} from "../src/effect";
import { arrondissements, divisions, regions } from "./fixtures";

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

  test("can be replaced in tests", () => {
    const stub = Layer.succeed(
      CameroonLocations,
      CameroonLocations.of({
        getRegion,
        getDivision: () => Effect.die("unused"),
        getArrondissement,
        getUnit: (pcode) => Effect.fail(new LocationNotFound({ query: pcode })),
      }),
    );
    const error = Effect.runSync(
      Effect.flip(program.pipe(Effect.provide(stub))),
    );
    expect(error._tag).toBe("LocationNotFound");
    expect(Effect.runSync(getUnit("CM002")).pcode).toBe("CM002");
  });
});

// tsdown runs under Node: its bundler hangs under the Bun runtime.
test("the effect entry imports effect instead of bundling it", async () => {
  const cwd = join(import.meta.dir, "..");
  const outDir = await mkdtemp(join(tmpdir(), "cl-effect-"));
  try {
    const { exitCode, stderr } = Bun.spawnSync(
      ["node_modules/.bin/tsdown", "-d", outDir, "-l", "error", "--no-dts"],
      { cwd },
    );
    expect(stderr.toString()).toBe("");
    expect(exitCode).toBe(0);
    for (const file of ["effect.js", "effect.cjs"]) {
      const code = await readFile(join(outDir, file), "utf8");
      expect(code).toMatch(/from"effect"|require\("effect"\)/);
      // Effect's internal type ids would appear if it were bundled.
      expect(code).not.toContain("~effect/");
      expect(code.length).toBeLessThan(20_000);
    }
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}, 60_000);
