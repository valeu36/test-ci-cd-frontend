import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { HealthCard } from "@/components/health-card";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{t("home.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("home.subtitle")}</p>
      </div>
      <HealthCard />
    </main>
  );
}
