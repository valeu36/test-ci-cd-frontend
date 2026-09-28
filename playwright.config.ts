import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite for the SPA, against the REAL backend.
 *
 * The backend is booted by the first `webServer` entry below (the backend
 * repo's `npm run e2e:serve`: Docker Postgres, migrations, then the API).
 * Nothing in this suite fakes a response — failure modes a live backend will
 * not produce on demand belong in the Vitest unit suite.
 *
 * **Two origins, not one.** `VITE_API_URL` is baked into the bundle as an
 * absolute URL, so the SPA's requests leave :4173 for the API's port —
 * cross-origin, the shape a deployed environment has too. That is why the
 * backend's generated .env.testing lists http://localhost:4173 in CORS_ORIGINS.
 */

/** Where the backend repo lives relative to this one (overridden in CI). */
const backendDir = process.env.E2E_BACKEND_DIR ?? "../test-ci-cd-backend";

/**
 * The API's port. 3000 is the default, and what CI uses; override it locally
 * when a dev backend already holds :3000 — otherwise its webServer entry fails
 * with "port already used" rather than silently testing the wrong server.
 */
const apiPort = process.env.E2E_API_PORT ?? "3000";
const apiOrigin = `http://localhost:${apiPort}`;

export default defineConfig({
  // Must be set: Playwright's default testMatch would otherwise also collect
  // src/**/*.test.ts, which belongs to Vitest.
  testDir: "./e2e",

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    // 4173, not the dev server's 5173 — see the webServer note below.
    baseURL: "http://localhost:4173",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /**
   * The suite runs against the **production bundle**, not the dev server: it
   * is what ships. `reuseExistingServer: false` for both — a stale `dist/` or
   * an unrelated process on the API port would otherwise be adopted silently.
   */
  webServer: [
    {
      command: `npm --prefix ${backendDir} run e2e:serve`,
      url: `${apiOrigin}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "pipe",
      stderr: "pipe",
      // A real env var wins over the backend's .env.testing.
      env: { PORT: apiPort },
    },
    {
      command: "npm run build && npm run preview:e2e",
      url: "http://localhost:4173",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_API_URL: `${apiOrigin}/api`,
        // The preview server inherits `server.proxy` from vite.config.ts;
        // pinned so a developer's .env.local pointing elsewhere cannot leak in.
        API_PROXY_TARGET: apiOrigin,
      },
    },
  ],
});
