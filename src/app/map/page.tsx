import type { Metadata } from "next";
import { searchOptions } from "@/lib/search-options";
import { ExploreClient } from "@/app/explore/explore-client";
export const metadata: Metadata = {
  title: "Map view",
  alternates: { canonical: "/explore" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <ExploreClient {...searchOptions(params)} />;
}
