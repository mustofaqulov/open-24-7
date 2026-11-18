import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { HoursEditor } from "@/app/business/dashboard/owner-dashboard";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await sessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const business = await db.business.findUnique({
    where: { id },
    include: { hours: true, exceptions: true },
  });
  if (!business) redirect("/admin/businesses");
  const item = {
    id: business.id,
    status: "VERIFIED",
    business: {
      id: business.id,
      name: business.name,
      address: business.address,
      verification: business.verification,
      temporarilyClosed: business.temporarilyClosed,
      hours: business.hours.map((h) => ({
        weekday: h.weekday,
        openMinute: h.openMinute,
        closeMinute: h.closeMinute,
        isClosed: h.isClosed,
      })),
      exceptions: business.exceptions.map((h) => ({
        localDate: h.localDate,
        openMinute: h.openMinute,
        closeMinute: h.closeMinute,
        isClosed: h.isClosed,
      })),
    },
  };
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>{business.name} hours</h1>
          <p>Administrator changes are recorded in the audit log.</p>
        </div>
        <div className="panel content-card">
          <HoursEditor item={item} />
        </div>
      </div>
    </div>
  );
}
