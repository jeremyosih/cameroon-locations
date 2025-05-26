import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "KenyaLocations",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "cjs" ? "cjs" : "js"}`,
    },
    rollupOptions: {
      external: [],
    },
    copyPublicDir: false,
  },
  plugins: [dts({ include: ["lib"] })],
});
