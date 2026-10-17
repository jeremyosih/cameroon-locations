# Location Script Guidelines

## Commands
- Install: `bun install`
- Run: `bun run index.ts ./loc.pdf`
- Type Check: `bun run tsc --noEmit`
- Format: `bun run prettier --write .`

## Code Style
- TypeScript with strict type checking
- Use explicit type annotations for function parameters and returns
- Use interfaces for complex data structures
- Prefer async/await over callbacks
- Use meaningful variable names (camelCase for variables, PascalCase for interfaces)
- Add assertions for validating assumptions and input correctness
- Handle all error conditions with try/catch blocks
- Use named function parameters over positional parameters
- Include descriptive comments for complex logic
- Use null assertion (!) sparingly, prefer explicit checks
- Use Bun's native APIs for file operations (Bun.file(), Bun.write()) instead of Node.js fs modules

## Repository Structure
- Main script: `index.ts`
- Input: PDF files containing hierarchical location data
- Output: JSON file with structured location information