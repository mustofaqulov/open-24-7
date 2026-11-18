import { redirect } from "next/navigation";
import { canModerate, sessionUser } from "@/lib/auth";
import { BusinessAdmin } from "./business-admin";
export default async function Page() {
  const user = await sessionUser();
  if (!user || !canModerate(user.role)) redirect("/login");
  return <BusinessAdmin canEdit={user.role === "ADMIN"} />;
}
