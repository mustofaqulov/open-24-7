import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/categories", (route) =>
    route.fulfill({ json: { items: [] } }),
  );
  await page.route("**/api/v1/places/search", (route) =>
    route.fulfill({ json: { items: [], total: 0, limit: 12 } }),
  );
});

test("homepage radius and 24/7 shortcuts apply real search filters", async ({
  page,
}) => {
  const requests: { radius: number; alwaysOpen: string }[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/v1/places/search"))
      requests.push(request.postDataJSON());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "25 km", exact: true }).click();
  await expect(page.locator(".radius-value")).toHaveText("25km");
  await page.locator(".radius-result a").click();
  await expect(page).toHaveURL(/radius=25/);
  await expect(page.locator("#radius")).toHaveValue("25");
  await expect.poll(() => requests.at(-1)?.radius).toBe(25);
  await page.goto("/");
  await page.locator('.hero-quicklinks a[href*="alwaysOpen"]').click();
  await expect(page.getByLabel("24/7", { exact: true })).toBeChecked();
  await expect.poll(() => requests.at(-1)?.alwaysOpen).toBe("true");
});

test("invalid radius is replaced with the default on all search entry points", async ({
  page,
}) => {
  for (const route of [
    "/explore?radius=999",
    "/search?radius=-2",
    "/map?radius=NaN",
  ]) {
    await page.goto(route);
    await expect(page.locator("#radius")).toHaveValue("10");
  }
});

test("menu and FAQ work with a keyboard and benefits change without navigation", async ({
  page,
}) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle menu" });
  await menu.click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.locator(".benefit-tabs button").nth(1).click();
  await expect(page.locator(".benefits-copy h2")).toHaveText(
    "A clearer picture.",
  );
  const question = page.locator(".faq-list summary").first();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq-list details").first()).toHaveAttribute(
    "open",
    "",
  );
  await expect(
    page.locator(".faq-list details").first().locator("p"),
  ).toBeVisible();
});

test("new layout fits narrow screens in every language and theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  for (const locale of ["RU", "UZ", "EN"]) {
    await page.locator("#locale").click();
    await page.getByRole("option", { name: locale, exact: true }).click();
    for (let mode = 0; mode < 2; mode++) {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator(".theme-toggle").click();
    }
  }
});
