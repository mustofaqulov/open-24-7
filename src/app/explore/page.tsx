import type { Metadata } from "next";
import { searchOptions } from "@/lib/search-options";
import { ExploreClient } from "./explore-client";
export const metadata: Metadata = {
  title: "Explore places",
  description:
    "Search verified businesses and services near your chosen location.",
};
export default async function Explore({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <ExploreClient {...searchOptions(params)} />;
}
