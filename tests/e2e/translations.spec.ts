import { test, expect } from "@playwright/test";
import { messages } from "../../src/lib/messages";

test("about, business and contact content switches between all languages", async ({
  page,
}) => {
  for (const path of ["/about", "/business", "/contact"]) {
    await page.goto(path);
    for (const locale of ["uz", "ru", "en"] as const) {
      const t = messages[locale];
      await page.locator("#locale").click();
      await page
        .getByRole("option", { name: locale.toUpperCase(), exact: true })
        .click();
      const keys =
        path === "/about"
          ? ([
              "aboutTitle",
              "aboutIntro",
              "aboutStart",
              "aboutCoverage",
              "aboutStatus",
              "aboutStatusDescription",
              "aboutOwners",
              "aboutOwnersDescription",
            ] as const)
          : path === "/business"
            ? ([
                "businessEyebrow",
                "businessTitle",
                "businessIntro",
                "businessHow",
                "businessProcess",
                "registerBusiness",
                "openDashboard",
              ] as const)
            : ([
                "contactTitle",
                "contactIntro",
                "name",
                "email",
                "messageLabel",
                "sendMessage",
              ] as const);
      for (const key of keys)
        await expect(
          page.locator("main").getByText(t[key], { exact: true }),
        ).toBeVisible();
    }
  }
});

test("contact success and failure messages stay translated after switching languages", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("open24-locale", "uz"));
  let fail = false;
  await page.route("**/api/v1/contact", (route) =>
    route.fulfill({ status: fail ? 503 : 200, json: {} }),
  );
  await page.goto("/contact");
  async function fill() {
    await page.locator("#contact-name").fill("Test User");
    await page.locator("#contact-email").fill("test@example.com");
    await page.locator("#contact-message").fill("Translation test message");
    await page.locator("main button").click();
  }
  await fill();
  await expect(page.getByRole("status")).toHaveText(
    messages.uz.messageReceived,
  );
  await page.locator("#locale").click();
  await page.getByRole("option", { name: "RU", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    messages.ru.messageReceived,
  );
  fail = true;
  await fill();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    messages.ru.messageFailed,
  );
  await page.locator("#locale").click();
  await page.getByRole("option", { name: "UZ", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    messages.uz.messageFailed,
  );
});

test("nearby heading and unavailable state follow the selected language", async ({
  page,
}) => {
  await page.route("**/api/v1/places/search", (route) =>
    route.fulfill({ status: 503, json: { error: { message: "Unavailable" } } }),
  );
  await page.goto("/");
  for (const [code, heading, error, help] of [
    [
      "UZ",
      "Yaqin atrofdagi joylar",
      "Joylar haqidagi ma’lumotlar vaqtincha mavjud emas.",
      "Shaharni tanlang yoki joylashuvingizni ulashing.",
    ],
    [
      "RU",
      "Места поблизости",
      "Информация о местах временно недоступна.",
      "Выберите город или поделитесь местоположением.",
    ],
    [
      "EN",
      "Nearby places",
      "Places are temporarily unavailable.",
      "Choose a city or share your location.",
    ],
  ]) {
    await page.locator("#locale").click();
    await page.getByRole("option", { name: code, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(error, { exact: true })).toBeVisible();
    await expect(
      page.locator(".steps-list li").filter({ hasText: help }),
    ).toBeVisible();
  }
});

test("nearby empty state is translated", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("open24-locale", "uz"));
  await page.route("**/api/v1/places/search", (route) =>
    route.fulfill({ json: { items: [], total: 0 } }),
  );
  await page.goto("/");
  await expect(
    page.getByText("Bu hududda mos joy topilmadi.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Yaqin atrofdagi joylar" }),
  ).toBeVisible();
});
