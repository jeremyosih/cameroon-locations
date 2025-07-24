import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "lib/index.ts"),
        "extensions/elecam/index": resolve(__dirname, "lib/extensions/elecam/index.ts"),
        "extensions/geojson/index": resolve(__dirname, "lib/extensions/geojson/index.ts"),
      },
      name: "CameroonLocations",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "cjs" ? "cjs" : "js"}`,
    },
    rollupOptions: {
      external: [],
    },
    copyPublicDir: false,
  },
  plugins: [dts({ include: ["lib"] })],
});
