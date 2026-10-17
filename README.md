# cameroon-locations

Cameroon's administrative divisions as a typed, zero-dependency TypeScript
package: 10 regions, 58 divisions, 360 arrondissements, 1,504 cantons and
17,070 villages, keyed by official OCHA P-codes, with bilingual names, 2005
census population, GeoJSON boundaries and 2025 polling stations.

**Docs: https://cameroon-locations.vercel.app**

<p>
  <a href="https://sdfcameroon.org"><img src="https://raw.githubusercontent.com/jeremyosih/cameroon-locations/main/apps/docs/public/sponsors/sdf.png" alt="Social Democratic Front (SDF) logo" width="64" height="64"></a>
  <br>
  Brought to you by the <a href="https://sdfcameroon.org">SDF</a> (Social Democratic Front).
</p>

```sh
npm install cameroon-locations
```

## Quick start

```ts
import { getAncestors, getArrondissement, getRegion } from "cameroon-locations";
import { search } from "cameroon-locations/search";

getRegion("Far-North")?.pcode; // "CM004"
getRegion("CM002")?.name; // { fr: "Centre", en: "Centre" }

const yde1 = getArrondissement("Yaounde 1er"); // any spelling
yde1?.name.fr; // "Yaoundé I"
getAncestors("CM002007001").map((u) => u.name.fr); // ["Centre", "Mfoundi"]

search("bamenda", { levels: ["arrondissement"], limit: 3 });
```

Records are plain, deep-frozen, JSON-serialisable objects. Lookups return
`T | undefined` or readonly arrays and never throw; only
`cameroon-locations/effect` reports errors, as typed Effect errors. ESM and
CommonJS (`cameroon-locations/effect` is ESM-only), Node 20.19+.

## Entry points

| Import                         | Contents                                                       |
| :----------------------------- | :------------------------------------------------------------- |
| `cameroon-locations`           | Regions, divisions, arrondissements, lookups, `normalizeName`, `metadata`, `sources`, `attribution()` |
| `cameroon-locations/cantons`   | 1,504 cantons                                                  |
| `cameroon-locations/villages`  | 17,070 villages and quartiers                                  |
| `cameroon-locations/search`    | `search`, `createSearch`                                       |
| `cameroon-locations/geo`       | `locate`, `nearest`, `distanceKm`                              |
| `cameroon-locations/elecam`    | Polling stations and council summaries (July 2025)             |
| `cameroon-locations/effect`    | Effect adapter (optional `effect` peer)                        |
| `cameroon-locations/geojson/*` | Simplified OCHA boundaries                                     |

Prefer to own the code? Copy the core with shadcn:

```sh
npx shadcn@latest add https://cameroon-locations.vercel.app/r/cameroon-locations-core.json
```

## Documentation

- [Installation](https://cameroon-locations.vercel.app/docs/installation)
- [Regions & lookups](https://cameroon-locations.vercel.app/docs/lookups)
- [Data model](https://cameroon-locations.vercel.app/docs/data-model)
- [Data & sources](https://cameroon-locations.vercel.app/docs/data-sources)
- [Migration from 0.1](https://cameroon-locations.vercel.app/docs/migration)

## Repository

- `packages/cameroon-locations`: the npm package
- `apps/docs`: the docs site and shadcn registry
- `data`: the source pool (Git LFS) and the canonical dataset the package is
  built from

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

## Attribution

The data is derived from public sources that keep their own terms. If you
display or redistribute it, credit the sources you use; `attribution()`
returns the text.

- Boundaries, P-codes and names: OCHA COD-AB Cameroon (INC / OCHA), CC BY-IGO 3.0
- Cantons, villages and 2005 population: BUCREP, RGPH 2005
- Polling stations: ELECAM 2025 electoral roll, probably the July 2025
  provisional roll (download origin not recorded). ELECAM publishes the
  official lists as PDFs on [its portal](https://portail.elecam.cm/fr/documentation/).

Full list, archived copies and checksums: [NOTICE.md](NOTICE.md).

Forked from [kenya-locations](https://github.com/DavidAmunga/kenya-locations)
by [David Amunga](https://github.com/DavidAmunga).

## Licence

Code: [MIT](LICENSE). The data is not covered by the MIT licence: it keeps
the terms of its sources, listed in [NOTICE.md](NOTICE.md). Both files ship in
the npm package.
