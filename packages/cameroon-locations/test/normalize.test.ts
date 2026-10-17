import { expect, test } from "bun:test";
import { normalizeName } from "../src/normalize";

test("numbering, accents, case and punctuation fold together", () => {
  for (const name of [
    "Yaoundé 1er",
    "Yaounde I",
    "YAOUNDE 1ER",
    "Yaoundé-1",
    "yaounde 1st",
  ]) {
    expect(normalizeName(name)).toBe("yaounde 1");
  }
  expect(normalizeName("Extrême-Nord")).toBe(normalizeName("extreme nord"));
  expect(normalizeName("Nyong-et-So'o")).toBe("nyong et soo");
  // Compatibility forms (NFKD): the "Ⅱ" numeral sign and full-width letters.
  expect(normalizeName("ＹＡＯＵＮＤＥ Ⅱ")).toBe("yaounde 2");
});

test("a lone or inner roman numeral is a word, not a number", () => {
  expect(normalizeName("Vi")).toBe("vi");
  expect(normalizeName("Mbe")).toBe("mbe");
  expect(normalizeName("Kentzou II")).toBe("kentzou 2");
});
