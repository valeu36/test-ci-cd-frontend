import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HealthCard } from "@/components/health-card";

function renderCard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HealthCard />
    </QueryClientProvider>,
  );
}

describe("HealthCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks the versioned health endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ status: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    renderCard();

    expect(await screen.findByTestId("health-ok")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/health");
  });

  it("reports a reachable API with its status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ status: "ok" })),
    );

    renderCard();

    expect(screen.getByTestId("health-pending")).toBeInTheDocument();
    expect(await screen.findByTestId("health-ok")).toHaveTextContent(
      "API reachable — status: ok",
    );
  });

  it("reports an unreachable API when the check fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    renderCard();

    expect(await screen.findByTestId("health-error")).toHaveTextContent(
      "API unreachable",
    );
  });
});
