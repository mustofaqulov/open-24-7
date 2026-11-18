import type { Metadata } from "next";
import { BusinessClient } from "./business-client";
export const metadata: Metadata = { title: "For business owners" };
export default function Page() {
  return <BusinessClient />;
}
