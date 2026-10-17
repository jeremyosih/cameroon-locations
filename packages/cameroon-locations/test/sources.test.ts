import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  attribution,
  getSources,
  REPOSITORY_URL,
  sources,
} from "../src/sources";
import type { SourceId } from "../src/types";

const root = join(import.meta.dir, "../../..");

test("every source has a licence, an online URL and an archived copy in the repo", () => {
  for (const [id, s] of Object.entries(sources)) {
    expect(s.id).toBe(id as typeof s.id);
    expect(s.license).not.toBe("");
    expect(s.url).toStartWith("https://");
    expect(s.repositoryUrl).toStartWith(`${REPOSITORY_URL}/`);
    const path = s.repositoryUrl.replace(/^.*\/(tree|blob)\/main\//, "");
    expect(existsSync(join(root, path))).toBe(true);
  }
});

test("source records cannot be modified", () => {
  expect(Object.isFrozen(sources["ocha-cod-ab-cmr"])).toBe(true);
});

test("getSources and attribution skip unknown ids and return frozen arrays", () => {
  const ids = ["wikidata", "nope", "toString", "wikidata"] as SourceId[];
  const list = getSources(ids);
  expect(list.map((s) => s.id)).toEqual(["wikidata"]);
  expect(Object.isFrozen(list)).toBe(true);
  expect(attribution(ids)).toBe(sources.wikidata.attribution);
});
