import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OwnerDashboard } from "./owner-dashboard";
export const metadata: Metadata = {
  title: "Business dashboard",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await sessionUser();
  if (!user) redirect("/login");
  const items = await db.ownership.findMany({
    where: { userId: user.id },
    include: { business: { include: { hours: true, exceptions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <OwnerDashboard
      initial={items.map((i) => ({
        id: i.id,
        status: i.status,
        business: {
          id: i.business.id,
          name: i.business.name,
          address: i.business.address,
          verification: i.business.verification,
          temporarilyClosed: i.business.temporarilyClosed,
          hours: i.business.hours.map((h) => ({
            weekday: h.weekday,
            openMinute: h.openMinute,
            closeMinute: h.closeMinute,
            isClosed: h.isClosed,
          })),
          exceptions: i.business.exceptions.map((h) => ({
            localDate: h.localDate,
            openMinute: h.openMinute,
            closeMinute: h.closeMinute,
            isClosed: h.isClosed,
          })),
        },
      }))}
    />
  );
}
