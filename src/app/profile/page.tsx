import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await sessionUser();
  if (!user) redirect("/login");
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">ACCOUNT</span>
          <h1>{user.displayName}</h1>
          <p>{user.email}</p>
        </div>
        <div className="panel content-card">
          <h2>Your Open24</h2>
          <p>
            Manage your saved places, business profiles, and account
            preferences.
          </p>
          <div className="detail-actions">
            <Link className="button button-small" href="/favorites">
              Favorites
            </Link>
            <Link
              className="button button-outline button-small"
              href="/recent-searches"
            >
              Recent searches
            </Link>
            <Link
              className="button button-outline button-small"
              href="/business/dashboard"
            >
              Business dashboard
            </Link>
            {user.role === "ADMIN" || user.role === "MODERATOR" ? (
              <Link
                className="button button-outline button-small"
                href="/admin"
              >
                Admin dashboard
              </Link>
            ) : null}
            <Link
              className="button button-outline button-small"
              href="/settings"
            >
              Settings
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
