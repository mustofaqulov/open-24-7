import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { SettingsClient } from "./settings-client";
export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await sessionUser();
  if (!user) redirect("/login");
  return <SettingsClient name={user.displayName} locale={user.locale} />;
}
