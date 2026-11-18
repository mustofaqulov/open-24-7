import { test, expect } from "@playwright/test";
test("manual city search and empty state", async ({ page }) => {
  await page.goto("/explore");
  await page.getByRole("combobox", { name: "Select a city" }).click();
  await page.getByRole("option", { name: "Samarkand", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Select a city" }),
  ).toContainText("Samarkand");
  await expect(page.getByText(/Results ·/)).toBeVisible();
});
test("anonymous user cannot access admin tools", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  const response = await page.request.get("/api/v1/admin/queue");
  expect(response.status()).toBe(403);
});

test("anonymous user cannot open owner registration", async ({ page }) => {
  await page.goto("/business/register");
  await expect(page).toHaveURL(/\/login/);
  const response = await page.request.patch(
    "/api/v1/businesses/00000000-0000-4000-8000-000000000000",
    {
      headers: { Origin: new URL(page.url()).origin },
      data: { phone: "+998000000000" },
    },
  );
  expect(response.status()).toBe(401);
});

test("open filter and place details", async ({ page }) => {
  test.skip(
    !process.env.E2E_PLACE_SLUG,
    "Requires a reviewed business fixture",
  );
  await page.goto("/explore");
  await page.getByLabel("Open now").check();
  await expect(page.getByLabel("Open now")).toBeChecked();
  await page.goto(`/places/${process.env.E2E_PLACE_SLUG}`);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.getByText("Address", { exact: true })).toBeVisible();
});

test("register, save a favorite, and report incorrect hours", async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_PLACE_SLUG,
    "Requires a reviewed business fixture",
  );
  const email = `e2e-${Date.now()}@example.test`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Visitor");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("test-password-12345");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile/);
  await page.goto(`/places/${process.env.E2E_PLACE_SLUG}`);
  await page.getByRole("button", { name: "Save" }).click();
  await page.goto("/favorites");
  await expect(page.locator(".place-card")).toHaveCount(1);
  await page.goto(`/places/${process.env.E2E_PLACE_SLUG}`);
  await page.getByRole("button", { name: "Report hours" }).click();
  await page
    .getByLabel("Report hours")
    .fill("The published opening time is incorrect.");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Report received for review")).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/settings");
  await page.getByRole("button", { name: "Delete my account" }).click();
});
