import { defineConfig, type UserConfig } from "tsdown";

const entry = {
  index: "src/index.ts",
  cantons: "src/cantons.ts",
  villages: "src/villages.ts",
  search: "src/search.ts",
  geo: "src/geo.ts",
  elecam: "src/elecam.ts",
};

const common = {
  dts: true,
  platform: "neutral",
  target: "es2022",
  minify: true,
  external: [/^effect/],
} satisfies UserConfig;

export default defineConfig([
  // ESM: every entry, sharing chunks.
  { ...common, entry: { ...entry, effect: "src/effect.ts" }, format: "esm" },
  // CJS: every entry but `effect`, which is ESM-only like `effect` itself.
  { ...common, entry, format: "cjs" },
]);
