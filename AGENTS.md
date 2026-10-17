# AGENTS.md - Development Guidelines

`CLAUDE.md` is a symlink to this file. Edit this file only.

## Where the data comes from

All location data originates in `data/`, the source pool. It is stored in Git LFS and **never
shipped to npm** (`package.json` `files: ["dist"]`).

- `data/README.md`: index of sources, their licences and trust levels. Start here.
- `data/sources/<id>/`: one folder per source, holding `raw/` (untouched downloads plus
  `SHA256SUMS`) and `SOURCE.md` (origin URL, licence, retrieval date, known limits).
  - `ocha-cod-ab-cmr`: authoritative P-codes, names, areas, centroids and boundaries (CC BY-IGO).
  - `bucrep-rgph2005-repertoire-villages`: the 2005 census directory. Cantons, villages and
    population.
  - `elecam-polling-stations-2025`: polling stations and registered voters (July 2025 snapshot).
  - `geoboundaries-cmr-gbopen`: OSM-derived boundaries, used for cross-checks only. ADM3 is ODbL.
- `data/canonical/`: **the dataset the library must be built from**. JSON keyed by OCHA P-code
  (`CM001`, `CM001001`, `CM001001001`). Every value carries its source id. See
  `data/canonical/README.md` for the schema.
- `data/DECISIONS.md`: judgement calls (naming, reassignments). `data/research/`: web research with
  URL citations (decrees, Wikidata, history).
- `data/derived/location-script-2025-07/`: archive of the July 2025 extraction pipeline and its
  known defects. It's for reference only, so don't build from it.

### Rules for data changes

- Never edit `data/canonical/*.json` by hand. Rebuild with `cd data && ./tools/build-all.sh` (needs
  `bun` and `uv`). It must end with `errors: 0`.
- Fixes to text extraction go in `data/patches/`. Name-to-P-code decisions go in `data/crosswalks/`.
  Judgement calls go in `data/decisions/` and are logged in `data/DECISIONS.md`. Every entry needs a
  reason and evidence.
- Never delete or overwrite anything under `data/sources/*/raw`, `data/derived/*/snapshot` or
  `data/research/downloads`. A new source gets a new folder with a `SOURCE.md` and `SHA256SUMS`.
- Keep every spelling. Variants go in `aliases` with their source; they're never replaced.
- Values printed in a source are kept as printed, even when the source contradicts itself.
  Inconsistencies are listed in `data/canonical/issues.json`, not "fixed".
- `data/` is excluded from Prettier and ESLint on purpose, so raw files are never reformatted.

### Status

The published package is generated from `data/canonical/` (see below). The July 2025 export is
archived in `data/derived/location-script-2025-07/` only.

## Repository layout

Bun workspaces. Data flows one way: `data/sources` → `data/canonical` → `packages/*/generated`.

- `packages/cameroon-locations/`: the npm package. Zero runtime dependencies.
  - `src/types.ts`: the public data model. Records are plain, deep-frozen, JSON-serialisable
    objects keyed by OCHA P-code. Change it only on purpose; it's the contract for every entry point.
  - `src/sources.ts`: source registry (licence, online URL, archived copy URL, attribution).
    Every dataset and GeoJSON file must carry provenance from here (decision D7).
  - Entry points: `index` (regions, divisions, arrondissements, lookups), `cantons`, `villages`,
    `search`, `geo`, `elecam`, `effect` (optional `effect` peer). Heavy data is only reachable from
    its own entry point, so `import "cameroon-locations"` stays small.
  - `scripts/generate.ts`: `data/canonical` → `generated/*.json`. `scripts/geo.ts`: OCHA GeoJSON
    (needs LFS) → simplified `geojson/*`. Generated files are committed and never edited by hand.
  - `test/`: `bun test`. Test behaviour users rely on and data invariants; no snapshot or
    trivial getter tests.
- `apps/docs/`: Astro docs site. It also hosts the shadcn registry at `/r/*.json`
  (`registry.json` → `public/r`).
- `data/`: source pool (above). Excluded from Biome.

## Commands

- `bun install`
- `bun run check` / `bun run fix`: Biome lint + format
- `bun run typecheck`, `bun run test`, `bun run build`
- `bun run --filter cameroon-locations check:package`: publint + attw
- `bun run data:canonical`: rebuild `data/canonical` (needs `uv`; must end with `errors: 0`)
- `bun run data:generate`, `bun run data:geo`: regenerate the package data
- `bun run docs:dev`, `bun run docs:build`
- `bun run changeset`: every user-facing change needs one

Cloning requires `git-lfs`. Husky runs the LFS hooks (`.husky/pre-push`, `post-checkout`,
`post-commit`, `post-merge`) and Biome on staged files.

## Code Style

- TypeScript strict (`noUncheckedIndexedAccess`), ESM, `import type` for types. No `any`.
- Biome formats: 2 spaces, double quotes, semicolons, 80 columns.
- Public API: plain functions returning `T | undefined` or readonly arrays; never expose mutable
  internal state. JSDoc on every export. Errors only in the Effect adapter (tagged errors).
- Names: PascalCase types, camelCase values. Levels are `region`, `division`, `arrondissement`.
- Commits: Conventional Commits (`feat(search): …`, `data: …`), enforced by `.husky/commit-msg`.
