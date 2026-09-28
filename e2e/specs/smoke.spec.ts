import { expect, test } from "../fixtures/test";

/**
 * The shell renders, talks to the real API, and fails readably — against the
 * backend commit this run is paired with.
 */
test.describe("smoke", () => {
  test("the home page reports a reachable API", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Test CI/CD", level: 1 }),
    ).toBeVisible();
    await expect(page.getByTestId("health-ok")).toContainText("status: ok");
  });

  test("an unknown URL renders the not-found screen", async ({ page }) => {
    await page.goto("/no-such-screen");

    await expect(page.getByTestId("not-found")).toContainText("Page not found");
  });
});
