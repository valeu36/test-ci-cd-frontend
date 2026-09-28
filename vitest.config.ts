import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Separate from vite.config.ts on purpose: the TanStack Router plugin and the
// Tailwind plugin have no place in a jsdom unit-test run.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // A private repo's runner has 2 vCPUs and Vitest sizes its pool at
    // `availableParallelism - 1` — one worker, so every file runs strictly one
    // after another. "100%" is two there. Locally `vitest run` already claims
    // the whole machine, so this only applies under CI.
    maxWorkers: process.env.CI ? "100%" : undefined,
    // Mounting Radix controls in jsdom is slow enough that Vitest's 5s default
    // leaves little headroom on a loaded machine. 20s is a hang detector, not
    // a performance budget: a test that genuinely grew slow gets fixed.
    testTimeout: 20_000,
  },
});
