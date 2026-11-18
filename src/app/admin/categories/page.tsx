import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { CategoryAdmin } from "./category-admin";
export default async function Page() {
  const user = await sessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  return <CategoryAdmin />;
}
