import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["lib/tests/**/*.test.ts"],
    setupFiles: ["lib/tests/setup.ts"],
  },
});
