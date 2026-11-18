import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || "http://localhost:3000";
  const paths = [
    "",
    "/explore",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/business",
  ];
  let businesses: { slug: string; updatedAt: Date }[] = [];
  try {
    businesses = await db.business.findMany({
      where: { verification: "VERIFIED" },
      select: { slug: true, updatedAt: true },
      take: 10000,
    });
  } catch {}
  return [
    ...paths.map((path) => ({ url: `${base}${path}` })),
    ...businesses.map((b) => ({
      url: `${base}/places/${b.slug}`,
      lastModified: b.updatedAt,
    })),
  ];
}
