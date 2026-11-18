import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
export const metadata: Metadata = {
  title: "Favorites",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await sessionUser();
  if (!user) redirect("/login");
  const items = await db.favorite.findMany({
    where: { userId: user.id },
    include: { business: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Favorites</h1>
          <p>Your saved places.</p>
        </div>
        <div className="result-list">
          {items.map((item) => (
            <Link
              className="place-card"
              href={`/places/${item.business.slug}`}
              key={item.businessId}
            >
              <h3>{item.business.name}</h3>
              <p>
                {item.business.address}, {item.business.city}
              </p>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="empty">
              No favorites yet. <Link href="/explore">Explore places</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
