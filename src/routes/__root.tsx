import { createRootRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { RouteErrorFallback } from "@/components/error-fallback";
import { NotFound } from "@/components/not-found";

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const { TanStackRouterDevtools } =
        await import("@tanstack/react-router-devtools");
      return { default: TanStackRouterDevtools };
    })
  : null;

export const Route = createRootRoute({
  component: RootLayout,
  // The router's default is an unstyled dump of the error; this is the
  // app-shaped version, and every child route inherits it.
  errorComponent: RouteErrorFallback,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      {Devtools !== null && (
        <Suspense fallback={null}>
          <Devtools position="bottom-right" />
        </Suspense>
      )}
    </>
  );
}
