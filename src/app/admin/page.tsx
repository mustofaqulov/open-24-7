import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionUser, canModerate } from "@/lib/auth";
import { AdminDashboard } from "./admin-dashboard";
export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await sessionUser();
  if (!user || !canModerate(user.role)) redirect("/login");
  return <AdminDashboard role={user.role} />;
}
