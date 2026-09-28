import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

/**
 * What the router renders when a route's component, loader or beforeLoad
 * throws — instead of a blank page. "Try again" re-runs the failed route.
 *
 * The error's own message is shown only in development: in a production
 * bundle it could carry internals, and the user cannot act on it anyway.
 */
export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const retry = () => {
    reset();
    void router.invalidate();
  };

  return (
    <main
      data-testid="route-error"
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center gap-4 p-6"
    >
      <h1 className="text-2xl font-semibold">{t("error.title")}</h1>
      {import.meta.env.DEV && (
        <pre className="max-w-lg overflow-auto text-sm text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      )}
      <Button onClick={retry}>{t("error.retry")}</Button>
    </main>
  );
}
