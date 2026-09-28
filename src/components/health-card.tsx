import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthQueryOptions } from "@/services/api/health";

/**
 * Whether the SPA can reach its API. The smallest real round trip between the
 * two repos, which is what the e2e smoke spec asserts on.
 */
export function HealthCard() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useQuery(healthQueryOptions);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("health.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p data-testid="health-pending" className="text-muted-foreground">
            {t("health.checking")}
          </p>
        )}
        {isError && (
          <p data-testid="health-error" className="text-destructive">
            {t("health.error")}
          </p>
        )}
        {data && (
          <p data-testid="health-ok">
            {t("health.ok", { status: data.status })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
