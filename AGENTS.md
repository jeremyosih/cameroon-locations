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

`lib/data/*.ts` and `lib/extensions/*` are still the July 2025 export, which has known defects:
invented cantons, and every village pointing to canton #1. See
`data/derived/location-script-2025-07/NOTES.md`. They are to be regenerated from `data/canonical/`.

## Build/Test Commands

- `pnpm build` - Build TypeScript and Vite bundle
- `pnpm test` - Run all tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `vitest run lib/tests/specific.test.ts` - Run single test file
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format with Prettier
- `pnpm validate` - Validate library data integrity (needs a build first)
- `cd data && ./tools/build-all.sh` - Rebuild and validate the canonical dataset

Cloning requires `git-lfs`. Husky runs the LFS hooks (`.husky/pre-push`, `post-checkout`,
`post-commit`, `post-merge`).

## Code Style

- **Imports**: Use `import type` for types, group by external/internal
- **Formatting**: Prettier config: 2 spaces, semicolons, double quotes, 80 char width
- **Types**: Strict TypeScript, explicit interfaces, no `any` (warn only)
- **Naming**: PascalCase for types/classes, camelCase for variables/functions
- **Error Handling**: Custom error classes extending Error with descriptive names
- **Comments**: JSDoc for public interfaces, minimal inline comments
- **Files**: Test files in `lib/tests/`, use `.test.ts` suffix
- **Data**: Validate data changes with `pnpm validate` before commit
- **Unused vars**: Prefix with `_` to ignore, no unused parameters/locals allowed
