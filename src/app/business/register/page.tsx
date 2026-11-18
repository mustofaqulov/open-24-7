import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { BusinessForm } from "./business-form";
export const metadata: Metadata = {
  title: "Register a business",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (!(await sessionUser())) redirect("/login");
  return <BusinessForm />;
}
