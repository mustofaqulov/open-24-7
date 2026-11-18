import { Prisma } from "@prisma/client";
import { db } from "./db";
import { isAlwaysOpen, openingStatus, todaysHours } from "./hours";
import { searchSchema } from "./validation";
import { z } from "zod";
type Search = z.infer<typeof searchSchema>;
type NearbyRow = { id: string; distance_m: number };
export async function searchPlaces(input: Search) {
  const origin = Prisma.sql`ST_SetSRID(ST_MakePoint(${input.lng},${input.lat}),4326)::geography`;
  const category = input.category
    ? Prisma.sql`AND c.key=${input.category}`
    : Prisma.empty;
  const like = `%${input.q ?? ""}%`;
  const query = input.q
    ? Prisma.sql`AND (b.name ILIKE ${like} OR b.address ILIKE ${like} OR b.city ILIKE ${like} OR c.name_uz ILIKE ${like} OR c.name_en ILIKE ${like} OR c.name_ru ILIKE ${like} OR EXISTS (SELECT 1 FROM category_translations ct WHERE ct.category_id=c.id AND ct.name ILIKE ${like}))`
    : Prisma.empty;
  const rows = await db.$queryRaw<NearbyRow[]>(
    Prisma.sql`SELECT b.id, ST_Distance(ST_SetSRID(ST_MakePoint(b.longitude,b.latitude),4326)::geography,${origin}) AS distance_m FROM businesses b JOIN categories c ON c.id=b.category_id WHERE b.verification='VERIFIED' AND ST_DWithin(ST_SetSRID(ST_MakePoint(b.longitude,b.latitude),4326)::geography,${origin},${input.radius * 1000}) ${category} ${query} ORDER BY distance_m ASC LIMIT 1000`,
  );
  const businesses = await db.business.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    include: {
      category: { include: { translations: true } },
      hours: true,
      exceptions: true,
      sources: { select: { provider: true } },
    },
  });
  const byId = new Map(businesses.map((b) => [b.id, b]));
  const all = rows.flatMap((row) => {
    const b = byId.get(row.id);
    if (!b) return [];
    const status = openingStatus(b);
    const alwaysOpen = isAlwaysOpen(b);
    if (input.openNow === "true" && status !== "OPEN") return [];
    if (input.alwaysOpen === "true" && !alwaysOpen) return [];
    return [
      {
        id: b.id,
        slug: b.slug,
        name: b.name,
        address: b.address,
        city: b.city,
        latitude: b.latitude,
        longitude: b.longitude,
        timezone: b.timezone,
        category: {
          key: b.category.key,
          nameUz: b.category.nameUz,
          nameEn: b.category.nameEn,
          nameRu: b.category.nameRu,
          translations: b.category.translations,
        },
        status,
        alwaysOpen,
        todaysHours: todaysHours(b),
        hoursVerifiedAt: b.hoursVerifiedAt,
        hoursSource: b.hoursSource,
        sources: b.sources.map((s) => s.provider),
        distanceMeters: Math.round(row.distance_m),
      },
    ];
  });
  const start = (input.page - 1) * input.limit;
  return {
    items: all.slice(start, start + input.limit),
    total: all.length,
    page: input.page,
    limit: input.limit,
    truncated: rows.length === 1000,
    distanceType: "straight_line" as const,
  };
}
