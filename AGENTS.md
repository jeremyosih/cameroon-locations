# AGENTS.md - Development Guidelines

## Build/Test Commands

- `pnpm build` - Build TypeScript and Vite bundle
- `pnpm test` - Run all tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `vitest run lib/tests/specific.test.ts` - Run single test file
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format with Prettier
- `pnpm validate` - Validate data integrity

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
