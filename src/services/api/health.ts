import { queryOptions } from "@tanstack/react-query";

import { API_V1_URL } from "@/services/api/config";

/** The backend's terminus payload for GET /api/v1/health. */
export type HealthResponse = {
  status: "ok" | "error" | "shutting_down";
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_V1_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}

export const healthQueryOptions = queryOptions({
  queryKey: ["health"],
  queryFn: fetchHealth,
});
