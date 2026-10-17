import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/site";

const pkg = fileURLToPath(
  new URL("../../packages/cameroon-locations/", import.meta.url),
);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Render docs from the package source, so the site builds without
      // `bun run build` first and can never drift from the code.
      alias: [
        // Registry components, imported by the demos the way users will.
        {
          find: /^@\/components\/(location-picker|cameroon-map)$/,
          replacement: fileURLToPath(
            new URL("./registry/$1/$1.tsx", import.meta.url),
          ),
        },
        {
          find: /^@\/components\/cameroon-map-leaflet$/,
          replacement: fileURLToPath(
            new URL(
              "./registry/cameroon-map/cameroon-map-leaflet.tsx",
              import.meta.url,
            ),
          ),
        },
        // The `cameroon-locations-core` registry item, as installed.
        {
          find: /^@\/lib\/cameroon-locations\/(.+)$/,
          replacement: `${pkg}src/$1`,
        },
        {
          find: /^cameroon-locations$/,
          replacement: `${pkg}src/index.ts`,
        },
        {
          find: /^cameroon-locations\/(cantons|villages|search|geo|elecam|effect)$/,
          replacement: `${pkg}src/$1.ts`,
        },
      ],
    },
  },
});
