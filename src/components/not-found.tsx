import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function NotFound() {
  const { t } = useTranslation();

  return (
    <main
      data-testid="not-found"
      className="flex min-h-svh flex-col items-center justify-center gap-4 p-6"
    >
      <h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
      <Button asChild variant="outline">
        <Link to="/">{t("notFound.back")}</Link>
      </Button>
    </main>
  );
}
