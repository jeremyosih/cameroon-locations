# docs

The cameroon-locations docs site and shadcn registry. Astro (static), MDX,
React islands, Tailwind v4 and shadcn/ui primitives.

```sh
bun run docs:dev     # from the repo root
bun run docs:build   # registry + static site into apps/docs/dist
bun run --filter docs typecheck
```

## Layout

- `src/site.ts`: `SITE_URL` (the only place the public URL lives), sidebar
  `NAV` and page paths.
- `src/content/docs/*.mdx`: one file per page. Every file must be listed in
  `NAV`; the build fails otherwise. The introduction is served at `/`, the
  rest at `/docs/<slug>`.
- `src/components/docs/`: doc components. Astro ones (`CodeBlock`,
  `ComponentPreview`, `PropsTable`, `Callout`, `Stats`, `SourcesTable`, …) are
  available in MDX without an import (`src/lib/mdx-components.ts`). React
  islands (`InstallCommand`, demos) need an import and a `client:*` directive.
- `src/components/demos/`: live previews for `ComponentPreview`.
- `src/components/ui/`: shadcn/ui primitives (`components.json`).
- `src/pages/llms.txt.ts`, `llms-full.txt.ts`: generated from the MDX.

## Data from the package

`cameroon-locations` is a workspace dependency, aliased to the package
**source** (`astro.config.ts` and `tsconfig.json` paths), so the site builds
without `bun run build` and renders counts, sources and attribution from the
real exports. While generated data is not wired in yet, `src/lib/package-data.ts`
falls back to the documented totals. Don't call lookups at build time until
they are implemented; demos catch the "not implemented" error.

## Doc components

```mdx
import InstallCommand from "@/components/docs/InstallCommand";
import Demo from "@/components/demos/my-demo";
import demoSource from "@/components/demos/my-demo.tsx?raw";

<InstallCommand client:load />                               {/* npm/pnpm/bun/yarn */}
<InstallCommand client:load packages="cameroon-locations effect" />
<InstallCommand client:load shadcn={registryUrl("my-item")} /> {/* shadcn add */}

<ComponentPreview code={demoSource}>                         {/* Preview / Code tabs */}
  <Demo client:load />
</ComponentPreview>

<CodeBlock code={source} lang="tsx" title="components/my-item.tsx" />
<PropsTable rows={[{ name: "value", type: "Pcode", default: "undefined", description: "…" }]} />
<Callout title="Note" tone="brand">…</Callout>
```

## shadcn registry

`registry.json` is the source of truth; `bun run registry` (run by `dev` and
`build`) does the rest via `scripts/registry.ts`:

1. Items with `meta.vendor` (like `cameroon-locations-core`) get their files
   copied from the package source into `registry/generated/<item>/`,
   following relative imports. `src/data/*` modules are replaced by literal,
   deep-frozen data, so the copy works without the npm package.
   `meta.target` sets the install folder (`lib/cameroon-locations`).
2. The expanded registry is written to `registry/generated/registry.json` and
   built with `shadcn build` into `public/r/*.json`.
3. `{{SITE_URL}}` anywhere in the output is replaced with `SITE_URL`. Use it
   for `registryDependencies` between items, e.g.
   `"{{SITE_URL}}/r/cameroon-locations-core.json"`.

Hand-written items (components) list their files normally, with paths
relative to `apps/docs` (e.g. `registry/location-picker/location-picker.tsx`).
`registry/generated/` and `public/r/` are build output and gitignored.

Users install with:

```sh
npx shadcn@latest add https://cameroon-locations.vercel.app/r/cameroon-locations-core.json
```
