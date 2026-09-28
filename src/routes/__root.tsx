import { createRootRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

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
