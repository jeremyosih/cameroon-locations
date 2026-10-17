/**
 * Checks the built bundle in dist/ (run `bun run build` first):
 * - the effect entry imports `effect` and doesn't inline it;
 * - the core entry doesn't reach canton, village or ELECAM data;
 * - entries stay under their size budgets;
 * - every CJS entry loads with Node's `require` (`effect` is ESM-only);
 * - the npm tarball ships LICENSE and NOTICE.md (runs `prepack`).
 *
 * Sizes are for an entry plus every chunk it statically imports (what a
 * bundler pulls in), minified, before compression. Budgets leave about 15%
 * headroom over the sizes measured when they were set; raise them on purpose.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "bun";

const pkgDir = join(import.meta.dir, "..");
const dist = join(pkgDir, "dist");

/** ESM entry → maximum bytes, including the chunks it imports. */
const BUDGETS: Record<string, number> = {
  "index.js": 160_000, // 134 kB on 2026-10-17
  "geo.js": 310_000, // 269 kB
  "villages.js": 470_000, // 406 kB
};

/** Entries whose data must never reach the core entry. */
const HEAVY = ["cantons", "villages", "elecam"];

const IMPORT = /(?:from|import)\s*"(\.\/[^"]+)"|require\("(\.\/[^"]+)"\)/g;

const failures: string[] = [];
const fail = (message: string) => failures.push(message);

function read(file: string): string {
  const path = join(dist, file);
  if (!existsSync(path)) {
    console.error(`dist/${file} is missing: run \`bun run build\` first.`);
    process.exit(1);
  }
  return readFileSync(path, "utf8");
}

/** The entry and every relative chunk it reaches. */
function closure(entry: string): Map<string, string> {
  const files = new Map<string, string>();
  const visit = (file: string) => {
    if (files.has(file)) return;
    const code = read(file);
    files.set(file, code);
    for (const [, esm, cjs] of code.matchAll(IMPORT)) {
      visit((esm ?? cjs ?? "").slice(2));
    }
  };
  visit(entry);
  return files;
}

// 1. effect stays an external peer, and its entry is ESM-only.
if (existsSync(join(dist, "effect.cjs"))) fail("dist/effect.cjs exists");
for (const file of ["effect.js"]) {
  if (!/from\s*"effect"/.test(read(file))) {
    fail(`dist/${file} does not import "effect"`);
  }
  for (const [chunk, text] of closure(file)) {
    // Effect's internal type ids only appear if its source was inlined.
    if (text.includes("~effect/")) fail(`dist/${chunk} inlines effect`);
  }
}

// 2. The core entry stays free of heavy data.
for (const file of ["index.js", "index.cjs"]) {
  for (const [chunk, text] of closure(file)) {
    if (HEAVY.some((name) => chunk.startsWith(name))) {
      fail(`dist/${file} imports dist/${chunk}`);
    }
    // Canton and village data is keyed by canton id, e.g. CM001001001-C01.
    if (/CM\d{9}-C\d{2}/.test(text)) {
      fail(`dist/${chunk}, reached from dist/${file}, holds canton data`);
    }
  }
}

// 3. Size budgets.
const kB = (bytes: number) => `${(bytes / 1000).toFixed(1)} kB`;
const rows = Object.entries(BUDGETS).map(([entry, budget]) => {
  const files = [...closure(entry).values()];
  const size = files.reduce((n, code) => n + Buffer.byteLength(code), 0);
  const gzip = gzipSync(files.join("")).byteLength;
  if (size > budget) {
    fail(`dist/${entry} is ${kB(size)}, over its ${kB(budget)} budget`);
  }
  return {
    entry,
    chunks: files.length,
    size: kB(size),
    gzip: kB(gzip),
    budget: kB(budget),
    used: `${Math.round((100 * size) / budget)}%`,
  };
});
console.table(rows);

// 4. CJS smoke test: every CJS entry loads in Node and works.
const smoke = `
const assert = require("node:assert/strict");
const core = require("./dist/index.cjs");
assert.equal(core.regions.length, 10);
assert.equal(core.getRegion("Centre").pcode, "CM002");
assert.equal(require("./dist/search.cjs").search("CM002")[0].item.pcode, "CM002");
assert.equal(require("./dist/cantons.cjs").cantons.length, 1504);
assert.equal(require("./dist/villages.cjs").villages.length, 17070);
assert.equal(require("./dist/geo.cjs").locate([9.7043, 4.0511]).divisionPcode, "CM005004");
assert.equal(require("./dist/elecam.cjs").pollingStations.length, 30353);
`;
const node = spawnSync("node", ["-e", smoke], {
  cwd: pkgDir,
  encoding: "utf8",
});
if (node.status !== 0) {
  fail(`CJS require smoke test failed: ${node.error ?? node.stderr}`);
}

// 5. The tarball ships the licence and the data notice (copied by prepack).
const pack = spawnSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: pkgDir,
  encoding: "utf8",
});
const json = pack.stdout?.slice(pack.stdout.search(/^\[$/m)) ?? "";
let packed: string[] = [];
try {
  packed = (JSON.parse(json) as { files: { path: string }[] }[]).flatMap((p) =>
    p.files.map((f) => f.path),
  );
} catch {
  fail(`npm pack --dry-run failed: ${pack.error ?? pack.stderr}`);
}
for (const file of ["LICENSE", "NOTICE.md", "README.md", "dist/index.cjs"]) {
  if (!packed.includes(file)) fail(`tarball lacks ${file}`);
}

if (failures.length) {
  for (const message of failures) console.error(`✗ ${message}`);
  process.exit(1);
}
console.log("✓ bundle checks passed");
