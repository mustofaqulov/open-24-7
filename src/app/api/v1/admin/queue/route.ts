import { canModerate, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json } from "@/lib/http";
export async function GET() {
  try {
    const user = await sessionUser();
    if (!user || !canModerate(user.role)) return error("Forbidden", 403);
    const [businesses, claims, reports] = await Promise.all([
      user.role === "ADMIN"
        ? db.business.findMany({
            where: { verification: "PENDING" },
            select: { id: true, name: true, address: true, city: true },
            take: 100,
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
      user.role === "ADMIN"
        ? db.ownership.findMany({
            where: { status: "PENDING" },
            include: {
              business: { select: { name: true, address: true } },
              user: { select: { displayName: true, email: true } },
            },
            take: 100,
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
      db.report.findMany({
        where: { state: "PENDING" },
        include: { business: { select: { name: true } } },
        take: 100,
        orderBy: { createdAt: "asc" },
      }),
    ]);
    return json({ businesses, claims, reports });
  } catch (e) {
    return handleError(e);
  }
}
