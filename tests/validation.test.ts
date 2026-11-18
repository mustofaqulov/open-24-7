import { describe, it, expect } from "vitest";
import {
  searchSchema,
  businessSchema,
  hoursSchema,
} from "../src/lib/validation";
describe("server validation", () => {
  it("bounds search radius and coordinates", () => {
    expect(searchSchema.safeParse({ lat: "91", lng: "65" }).success).toBe(
      false,
    );
    expect(
      searchSchema.safeParse({ lat: "38", lng: "65", radius: "51" }).success,
    ).toBe(false);
    expect(searchSchema.parse({ lat: "38", lng: "65" }).radius).toBe(10);
  });
  it("rejects invalid business coordinates and ids", () =>
    expect(
      businessSchema.safeParse({
        name: "Test",
        categoryId: "x",
        address: "Street 1",
        city: "Qarshi",
        latitude: 100,
        longitude: 65,
        timezone: "Asia/Tashkent",
      }).success,
    ).toBe(false));
  it("accepts overnight hours", () =>
    expect(
      hoursSchema.safeParse([
        { weekday: 1, openMinute: 1320, closeMinute: 120, isClosed: false },
      ]).success,
    ).toBe(true));
});
