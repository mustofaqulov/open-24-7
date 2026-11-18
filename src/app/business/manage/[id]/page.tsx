import { redirect } from "next/navigation";
import { sessionUser, canEditBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileEditor } from "./profile-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await sessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  if (!(await canEditBusiness(user.id, user.role, id)))
    redirect("/business/dashboard");
  const business = await db.business.findUnique({ where: { id } });
  if (!business) redirect("/business/dashboard");
  return (
    <ProfileEditor
      business={{
        id: business.id,
        name: business.name,
        address: business.address,
        city: business.city,
        description: business.description || "",
        phone: business.phone || "",
        website: business.website || "",
      }}
    />
  );
}
