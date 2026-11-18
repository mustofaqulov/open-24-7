import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { RecentSearches } from "./recent-client";
export default async function Page() {
  if (!(await sessionUser())) redirect("/login");
  return <RecentSearches />;
}
