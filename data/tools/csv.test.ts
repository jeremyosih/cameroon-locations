// Run with `bun test data/tools` (part of `bun run test`).
import { expect, test } from "bun:test";
import { parseCsv, parseCsvStrict } from "./csv";

test("quoted commas, escaped quotes, line breaks, CRLF and a BOM", () => {
  const text = '﻿A,B,C\r\nx,"a, b",1\r\ny,"say ""hi""",2\n"multi\nline",,3\r\n';
  expect(parseCsv(text)).toEqual([
    ["A", "B", "C"],
    ["x", "a, b", "1"],
    ["y", 'say "hi"', "2"],
    ["multi\nline", "", "3"],
  ]);
});

test("the ELECAM rows that used to shift columns", () => {
  const row = 'CENTRE,MFOUNDI,YAOUNDE V,"ESPLANADE DU STADE BENOUE ""OYACK RAILS\'\'",A,325';
  expect(parseCsv(row)[0]).toEqual([
    "CENTRE",
    "MFOUNDI",
    "YAOUNDE V",
    "ESPLANADE DU STADE BENOUE \"OYACK RAILS''",
    "A",
    "325",
  ]);
});

test("a last record without a line break is kept", () => {
  expect(parseCsv("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
});

test("malformed input fails loudly", () => {
  expect(() => parseCsv('a,"b\n1,2')).toThrow("unterminated");
  expect(() => parseCsvStrict("a,b\n1,2,3\n", "t.csv")).toThrow(
    "record 2 has 3 fields, expected 2",
  );
});
