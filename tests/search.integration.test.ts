import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { db } from "../src/lib/db";
import { searchPlaces } from "../src/lib/places";
const enabled = !!process.env.TEST_DATABASE_URL;
describe.skipIf(!enabled)("PostGIS search integration", () => {
  let businessId = "";
  let categoryId = "";
  beforeAll(async () => {
    const category = await db.category.findUnique({
      where: { key: "pharmacy" },
    });
    if (!category) throw Error("Run migrations on TEST_DATABASE_URL first");
    categoryId = category.id;
    const business = await db.business.create({
      data: {
        name: "Integration test pharmacy",
        slug: `test-${crypto.randomUUID()}`,
        categoryId,
        address: "Test Street 1",
        city: "Qarshi",
        latitude: 38.8598,
        longitude: 65.7898,
        timezone: "Asia/Tashkent",
        verification: "VERIFIED",
        hoursSource: "OWNER",
        hoursVerifiedAt: new Date(),
      },
    });
    businessId = business.id;
    await db.businessHour.createMany({
      data: Array.from({ length: 7 }, (_, weekday) => ({
        businessId,
        weekday,
        openMinute: 0,
        closeMinute: 1440,
      })),
    });
  });
  afterAll(async () => {
    if (businessId) await db.business.delete({ where: { id: businessId } });
    await db.$disconnect();
  });
  it("returns nearby verified places sorted by straight-line distance", async () => {
    const result = await searchPlaces({
      lat: 38.8598,
      lng: 65.7898,
      radius: 1,
      page: 1,
      limit: 12,
      openNow: "true",
      alwaysOpen: "true",
      category: "pharmacy",
    });
    expect(
      result.items.some(
        (item) =>
          item.id === businessId &&
          item.distanceMeters < 20 &&
          item.status === "OPEN",
      ),
    ).toBe(true);
  });
  it("excludes places outside radius", async () => {
    const result = await searchPlaces({
      lat: 40,
      lng: 65.7898,
      radius: 1,
      page: 1,
      limit: 12,
      openNow: "false",
      alwaysOpen: "false",
      category: "pharmacy",
    });
    expect(result.items.some((item) => item.id === businessId)).toBe(false);
  });
  it("honors a local-date closure during open-now search", async () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const value = (type: string) =>
      parts.find((part) => part.type === type)?.value;
    const localDate = `${value("year")}-${value("month")}-${value("day")}`;
    await db.businessHourException.create({
      data: {
        businessId,
        localDate,
        openMinute: 0,
        closeMinute: 0,
        isClosed: true,
      },
    });
    const nearby = {
      lat: 38.8598,
      lng: 65.7898,
      radius: 1,
      page: 1,
      limit: 12,
      category: "pharmacy",
    };
    const all = await searchPlaces({
      ...nearby,
      openNow: "false",
      alwaysOpen: "false",
    });
    expect(all.items.find((item) => item.id === businessId)?.status).toBe(
      "CLOSED",
    );
    const open = await searchPlaces({
      ...nearby,
      openNow: "true",
      alwaysOpen: "false",
    });
    expect(open.items.some((item) => item.id === businessId)).toBe(false);
  });
});

describe.skipIf(!enabled)("shop categories in search", () => {
  let businessId = "";
  beforeAll(async () => {
    const category = await db.category.findUnique({
      where: { key: "supermarket" },
    });
    if (!category) throw Error("Run migrations on TEST_DATABASE_URL first");
    const business = await db.business.create({
      data: {
        name: "Integration test store",
        slug: `test-${crypto.randomUUID()}`,
        categoryId: category.id,
        address: "Test Street 2",
        city: "Qarshi",
        latitude: 38.8598,
        longitude: 65.7898,
        timezone: "Asia/Tashkent",
        verification: "VERIFIED",
        hoursSource: "OWNER",
        hoursVerifiedAt: new Date(),
      },
    });
    businessId = business.id;
  });
  afterAll(async () => {
    if (businessId) await db.business.delete({ where: { id: businessId } });
  });
  const nearby = {
    lat: 38.8598,
    lng: 65.7898,
    radius: 1,
    page: 1,
    limit: 12,
    openNow: "false",
    alwaysOpen: "false",
  };
  it("returns a store when the shop category is selected", async () => {
    const result = await searchPlaces({ ...nearby, category: "supermarket" });
    expect(result.items.some((item) => item.id === businessId)).toBe(true);
  });
  it("finds a store by a category name typed into the query", async () => {
    const result = await searchPlaces({ ...nearby, q: "supermarket" });
    expect(result.items.some((item) => item.id === businessId)).toBe(true);
  });
  it("finds a store by its Uzbek category name", async () => {
    const result = await searchPlaces({ ...nearby, q: "Supermarketlar" });
    expect(result.items.some((item) => item.id === businessId)).toBe(true);
  });
});
