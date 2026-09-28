import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/services/api/fetcher";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns the parsed body of a 2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ status: "ok" })),
    );

    await expect(apiFetch("/api/v1/health")).resolves.toEqual({
      status: "ok",
    });
  });

  it("swaps the spec's /api prefix for VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com/api");
    vi.resetModules();
    const { apiFetch: fetchWithAbsoluteBase } =
      await import("@/services/api/fetcher");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}));
    vi.stubGlobal("fetch", fetchMock);

    await fetchWithAbsoluteBase("/api/v1/health");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/health",
      {},
    );
  });

  it("throws an ApiError carrying the backend's error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            statusCode: 400,
            error: "Bad Request",
            message: ["name must be a string", "name should not be empty"],
          },
          { status: 400 },
        ),
      ),
    );

    const failure = apiFetch("/api/v1/things");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 400,
      message: "name must be a string, name should not be empty",
      body: { error: "Bad Request" },
    });
  });

  it("handles an empty error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 502 })),
    );

    await expect(apiFetch("/api/v1/health")).rejects.toMatchObject({
      status: 502,
      body: null,
      message: "Request failed with HTTP 502",
    });
  });
});
