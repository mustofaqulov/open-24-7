import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PlaceDetailClient } from "./place-detail-client";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await db.business.findFirst({
    where: { slug, verification: "VERIFIED" },
    select: { name: true, address: true, city: true },
  });
  return business
    ? {
        title: business.name,
        description: `${business.name} in ${business.city}. Address: ${business.address}. Check reported opening hours on Open24.`,
        alternates: { canonical: `/places/${slug}` },
      }
    : { title: "Place not found", robots: { index: false, follow: false } };
}
export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PlaceDetailClient slug={slug} />;
}
