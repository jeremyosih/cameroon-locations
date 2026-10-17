import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cantons: "src/cantons.ts",
    villages: "src/villages.ts",
    search: "src/search.ts",
    geo: "src/geo.ts",
    elecam: "src/elecam.ts",
    effect: "src/effect.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  platform: "neutral",
  target: "es2022",
  minify: true,
  external: [/^effect/],
});
