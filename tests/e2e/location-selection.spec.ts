import { test, expect } from "@playwright/test";

test("address search uses the map centre and a new map point clears the old address", async ({ page }) => {
  await page.route("**/api/v1/categories", route => route.fulfill({ json: { items: [] } }));
  await page.route("**/api/v1/places/search", route => route.fulfill({ json: { items: [], total: 0, limit: 12 } }));
  const queries: { query: string; lat: number; lng: number }[] = [];
  await page.route("**/api/v1/geocode", route => {
    queries.push(route.request().postDataJSON());
    return route.fulfill({ json: { items: [{ point: { lat: 38.86, lng: 65.79 }, label: "Elbek ko‘chasi", source: "osm" }] } });
  });
  await page.goto("/explore");
  await page.locator("#manual-address").fill("Elbek");
  await page.getByRole("button", { name: "Find address", exact: true }).click();
  expect(queries[0]).toMatchObject({ query: "Elbek", lat: 38.8598, lng: 65.7898 });
  await page.getByRole("button", { name: "Elbek ko‘chasi", exact: true }).click();
  await expect(page.locator(".selected-location")).toContainText("Elbek ko‘chasi");
  const map = page.locator(".explore-map .leaflet-container");
  await expect(map).toBeVisible();
  await map.click({ position: { x: 180, y: 180 } });
  await expect(page.locator(".selected-location")).not.toContainText("Elbek");
  await expect(page.locator("#manual-address")).toHaveValue("");
  await expect(page.locator(".selected-location")).not.toContainText("38.86000, 65.79000");
  await page.locator("#manual-address").fill("Navoi");
  await page.getByRole("button", { name: "Find address", exact: true }).click();
  await expect.poll(() => queries.length).toBe(2);
  expect(queries[1].lat).not.toBe(38.86);
});
