/**
 * Base URL of the API, without the version segment. Baked in at build time by
 * Vite: relative ("/api", proxied by the dev server) locally, absolute in
 * every deployed environment. See .env.example.
 */
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export const API_V1_URL = `${API_URL}/v1`;
