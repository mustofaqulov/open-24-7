import { redirect } from "next/navigation";
import { sessionUser, canModerate } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function Page() {
  const user = await sessionUser();
  if (!user || !canModerate(user.role)) redirect("/login");
  let database = "Connected";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "Unavailable";
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>System health</h1>
          <p>Integration configuration and database connectivity.</p>
        </div>
        <div className="panel content-card">
          <div className="fact-row">
            <strong>Database</strong>
            <span>{database}</span>
          </div>
          <div className="fact-row">
            <strong>Google map</strong>
            <span>
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY &&
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED === "true"
                ? "Configured"
                : "Unavailable: key or approval missing"}
            </span>
          </div>
          <div className="fact-row">
            <strong>Google Routes</strong>
            <span>
              {process.env.GOOGLE_ROUTES_ENABLED === "true" &&
              process.env.GOOGLE_ROUTES_SERVER_KEY &&
              process.env.GOOGLE_MAPS_TERMS_APPROVED === "true" &&
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED === "true"
                ? "Configured"
                : "Unavailable: key or approval missing"}
            </span>
          </div>
          <div className="fact-row">
            <strong>Address search</strong>
            <span>
              {process.env.NOMINATIM_BASE_URL
                ? "Configured"
                : "Unavailable: endpoint missing"}
            </span>
          </div>
          <p>
            Configuration presence does not prove external coverage, billing,
            quotas, or live service health. Check provider dashboards and
            errors.
          </p>
        </div>
      </div>
    </div>
  );
}
