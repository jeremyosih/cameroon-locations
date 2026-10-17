/**
 * Site-wide settings. `SITE_URL` is the single place the public URL lives:
 * Astro's `site`, canonical links, `llms.txt` and the shadcn registry
 * (`{{SITE_URL}}` in `registry.json`) all read it.
 */
export const SITE_URL = "https://cameroon-locations.vercel.app";

export const SITE_NAME = "cameroon-locations";

export const SITE_DESCRIPTION =
  "Cameroon's administrative divisions as a typed, zero-dependency TypeScript package: regions, divisions, arrondissements, cantons and villages keyed by OCHA P-codes, with bilingual names, population, GeoJSON and polling stations.";

export const GITHUB_URL = "https://github.com/jeremyosih/cameroon-locations";

export const NPM_URL = "https://www.npmjs.com/package/cameroon-locations";

/** URL of a registry item, e.g. `registryUrl("cameroon-locations-core")`. */
export function registryUrl(name: string): string {
  return `${SITE_URL}/r/${name}.json`;
}

export interface NavItem {
  readonly slug: string;
  readonly label: string;
  /** Shown as a small "soon" marker in the sidebar. */
  readonly soon?: boolean;
}

export interface NavGroup {
  readonly label: string;
  readonly items: readonly NavItem[];
}

/** Sidebar order. Every page in `src/content/docs` must appear here. */
export const NAV: readonly NavGroup[] = [
  {
    label: "Get started",
    items: [
      { slug: "introduction", label: "Introduction" },
      { slug: "installation", label: "Installation" },
    ],
  },
  {
    label: "Core API",
    items: [
      { slug: "lookups", label: "Regions & lookups" },
      { slug: "data-model", label: "Data model" },
      { slug: "metadata", label: "Metadata & attribution" },
    ],
  },
  {
    label: "Entry points",
    items: [
      { slug: "cantons-villages", label: "Cantons & villages" },
      { slug: "search", label: "Search" },
      { slug: "geo", label: "Geo & GeoJSON" },
      { slug: "elecam", label: "ELECAM" },
      { slug: "effect", label: "Effect" },
    ],
  },
  {
    label: "Components",
    items: [
      { slug: "location-picker", label: "Location picker", soon: true },
      { slug: "cameroon-map", label: "Cameroon map", soon: true },
    ],
  },
  {
    label: "Project",
    items: [
      { slug: "data-sources", label: "Data & sources" },
      { slug: "migration", label: "Migration from 0.1" },
    ],
  },
];

/** Flat, ordered list of pages. */
export const PAGES: readonly NavItem[] = NAV.flatMap((g) => g.items);

/** Public path of a docs page. The introduction is the home page. */
export function pagePath(slug: string): string {
  return slug === "introduction" ? "/" : `/docs/${slug}`;
}
