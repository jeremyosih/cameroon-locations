# Contributing

Requirements: [Bun](https://bun.sh) 1.4+, `git-lfs` (for `data/`), and
[uv](https://docs.astral.sh/uv/) if you rebuild the canonical dataset.

```sh
git lfs install && git clone https://github.com/jeremyosih/cameroon-locations
bun install
bun run check && bun run typecheck && bun run test && bun run build
bun run docs:dev
```

## Changing data

Data flows one way: `data/sources` → `data/canonical` → `packages/cameroon-locations/generated`.

1. Never edit generated files. Fix the cause: a text-extraction fix in
   `data/patches/`, a name-to-P-code decision in `data/crosswalks/`, or a
   judgement call in `data/decisions/` logged in `data/DECISIONS.md`. Every
   entry needs a reason and evidence.
2. `bun run data:canonical` must end with `errors: 0`.
3. `bun run data:generate` and, for boundaries, `bun run data:geo`.
4. Add a changeset: `bun run changeset`.

See `AGENTS.md` for the full rules and `NOTICE.md` for attribution.
