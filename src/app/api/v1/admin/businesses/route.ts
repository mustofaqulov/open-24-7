import { canModerate, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json } from "@/lib/http";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const user = await sessionUser();
    if (!user || !canModerate(user.role)) return error("Forbidden", 403);
    const url = new URL(request.url);
    const query = z.string().trim().max(100).parse(url.searchParams.get("q") || "");
    const page = z.coerce.number().int().min(1).max(100).parse(url.searchParams.get("page") || "1");
    const where = query ? { name: { contains: query, mode: "insensitive" as const } } : {};
    const [items, total] = await Promise.all([
      db.business.findMany({ where, select: { id: true, name: true, address: true, city: true, verification: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, skip: (page - 1) * 30, take: 30 }),
      db.business.count({ where }),
    ]);
    return json({ items, total, page, limit: 30 });
  } catch (e) { return handleError(e); }
}
