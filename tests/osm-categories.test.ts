import { describe, expect, test } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { categoryFor } = require("../scripts/osm-categories.cjs") as {
  categoryFor: (tags: Record<string, string>) => string | null;
};

describe("categoryFor", () => {
  test("keeps the existing amenity mapping", () => {
    expect(categoryFor({ amenity: "pharmacy" })).toBe("pharmacy");
    expect(categoryFor({ amenity: "fuel" })).toBe("fuel");
    expect(categoryFor({ tourism: "hotel" })).toBe("hotel");
  });

  test("maps shop tags to the shop categories", () => {
    expect(categoryFor({ shop: "supermarket" })).toBe("supermarket");
    expect(categoryFor({ shop: "clothes" })).toBe("clothing");
    expect(categoryFor({ shop: "mobile_phone" })).toBe("mobile");
    expect(categoryFor({ shop: "doityourself" })).toBe("hardware");
    expect(categoryFor({ shop: "butcher" })).toBe("butcher");
    expect(categoryFor({ shop: "greengrocer" })).toBe("greengrocer");
  });

  test("maps a marketplace to the bazaar category", () => {
    expect(categoryFor({ amenity: "marketplace" })).toBe("bazaar");
  });

  test("prefers the amenity tag when both tags are present", () => {
    expect(categoryFor({ amenity: "pharmacy", shop: "clothes" })).toBe(
      "pharmacy",
    );
  });

  test("returns null for unmapped or missing tags", () => {
    expect(categoryFor({ shop: "pet" })).toBeNull();
    expect(categoryFor({ office: "company" })).toBeNull();
    expect(categoryFor({} as Record<string, string>)).toBeNull();
  });
});
