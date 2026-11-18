import { test, expect } from "@playwright/test";

test("theme persists and language menu supports keyboard selection", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const language = page.getByRole("combobox", {
    name: "Language",
    exact: true,
  });
  await language.click();
  await expect(page.getByRole("option")).toHaveCount(3);
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await page.getByRole("button", { name: "Tungi rejim" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("mobile menu and category navigation fit a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await page.getByRole("link", { name: "Pharmacies", exact: true }).click();
  await expect(page).toHaveURL(/category=pharmacy/);
});

test("system theme and select dismissal work without a stored preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const language = page.getByRole("combobox", {
    name: "Language",
    exact: true,
  });
  await language.click();
  await page.keyboard.press("Escape");
  await expect(language).toHaveAttribute("aria-expanded", "false");
  await expect(language).toBeFocused();
  await language.click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(language).toHaveAttribute("aria-expanded", "false");
});
