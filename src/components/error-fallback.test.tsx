import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteErrorFallback } from "@/components/error-fallback";

/**
 * Wired the way src/routes/__root.tsx wires it: a route whose component
 * throws renders the fallback, and "Try again" re-runs the route.
 */
function renderWithFailingRoute(component: () => ReactNode) {
  const rootRoute = createRootRoute({ errorComponent: RouteErrorFallback });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(<RouterProvider router={router} />);
}

describe("RouteErrorFallback", () => {
  it("replaces a crashed screen with the error page", async () => {
    // React logs the caught render error; it is expected here.
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithFailingRoute(() => {
      throw new Error("boom");
    });

    expect(await screen.findByTestId("route-error")).toHaveTextContent(
      "Something went wrong",
    );
  });

  it("re-renders the route on Try again", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let shouldThrow = true;

    renderWithFailingRoute(() => {
      if (shouldThrow) {
        throw new Error("boom");
      }
      return <p>recovered</p>;
    });

    await screen.findByTestId("route-error");
    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("recovered")).toBeInTheDocument();
  });
});
