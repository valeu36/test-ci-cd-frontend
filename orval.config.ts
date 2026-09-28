import { defineConfig } from "orval";

/**
 * Generates the API client and TanStack Query hooks from openapi.json — a
 * committed copy of the backend's spec (`npm run api:generate` refreshes it
 * from ../test-ci-cd-backend and regenerates).
 *
 * The output is committed too, so a plain checkout builds without the backend.
 * CI regenerates it (`npm run api:check`) and fails on any difference, and the
 * e2e job fails if this copy of the spec differs from the paired backend's.
 */
export default defineConfig({
  api: {
    input: "./openapi.json",
    output: {
      mode: "tags-split",
      target: "src/services/api/generated",
      schemas: "src/services/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        // The mutator returns the parsed body and throws ApiError on non-2xx,
        // so the generated functions resolve to the success schema itself
        // rather than a `{ data, status, headers }` union.
        fetch: { includeHttpResponseReturnType: false },
        mutator: {
          path: "src/services/api/fetcher.ts",
          name: "apiFetch",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write --log-level warn",
    },
  },
});
