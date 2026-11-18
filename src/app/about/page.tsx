import type { Metadata } from "next";
import { AboutClient } from "./about-client";
export const metadata: Metadata = { title: "About Open24" };
export default function Page() {
  return <AboutClient />;
}
