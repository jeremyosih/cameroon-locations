/**
 * Checks the built bundle in dist/ (run `bun run build` first):
 * - the effect entry imports `effect` and doesn't inline it;
 * - the core entry doesn't reach canton, village or ELECAM data;
 * - entries stay under their size budgets.
 *
 * Sizes are for an entry plus every chunk it statically imports (what a
 * bundler pulls in), minified, before compression. Budgets leave about 15%
 * headroom over the sizes measured when they were set; raise them on purpose.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "bun";

const dist = join(import.meta.dir, "../dist");

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

// 1. effect stays an external peer.
for (const file of ["effect.js", "effect.cjs"]) {
  const code = read(file);
  const imports = file.endsWith(".js")
    ? /from\s*"effect"/.test(code)
    : /require\("effect"\)/.test(code);
  if (!imports) fail(`dist/${file} does not import "effect"`);
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

if (failures.length) {
  for (const message of failures) console.error(`✗ ${message}`);
  process.exit(1);
}
console.log("✓ bundle checks passed");
