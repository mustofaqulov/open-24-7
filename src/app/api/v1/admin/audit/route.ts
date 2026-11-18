import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json } from "@/lib/http";
export async function GET() {
  try {
    const user = await sessionUser();
    if (user?.role !== "ADMIN") return error("Forbidden", 403);
    const items = await db.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    return json({ items });
  } catch (e) {
    return handleError(e);
  }
}
