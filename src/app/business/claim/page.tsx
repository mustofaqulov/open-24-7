import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { ClaimForm } from "./claim-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  if (!(await sessionUser())) redirect("/login");
  const { businessId } = await searchParams;
  return <ClaimForm businessId={businessId || ""} />;
}
