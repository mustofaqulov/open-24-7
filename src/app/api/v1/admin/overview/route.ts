import { canModerate, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json } from "@/lib/http";
export async function GET() {
  try {
    const user = await sessionUser();
    if (!user || !canModerate(user.role)) return error("Forbidden", 403);
    const [pendingBusinesses, pendingClaims, pendingReports, totalBusinesses] =
      await Promise.all([
        db.business.count({ where: { verification: "PENDING" } }),
        db.ownership.count({ where: { status: "PENDING" } }),
        db.report.count({ where: { state: "PENDING" } }),
        db.business.count(),
      ]);
    return json({
      pendingBusinesses,
      pendingClaims,
      pendingReports,
      totalBusinesses,
      mapsConfigured:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED === "true" &&
        !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY,
      routesConfigured:
        process.env.GOOGLE_ROUTES_ENABLED === "true" &&
        process.env.GOOGLE_MAPS_TERMS_APPROVED === "true" &&
        !!process.env.GOOGLE_ROUTES_SERVER_KEY,
      geocodingConfigured: !!process.env.NOMINATIM_BASE_URL,
    });
  } catch (e) {
    return handleError(e);
  }
}
