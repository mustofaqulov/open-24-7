import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function GET() {
  try {
    const user = await sessionUser();
    if (user?.role !== "ADMIN") return error("Forbidden", 403);
    const items = await db.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    return json({ items });
  } catch (e) {
    return handleError(e);
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const actor = await sessionUser();
    if (actor?.role !== "ADMIN") return error("Forbidden", 403);
    const { id, role } = z
      .object({
        id: z.uuid(),
        role: z.enum(["USER", "OWNER", "MODERATOR", "ADMIN"]),
      })
      .parse(await request.json());
    if (id === actor.id) return error("Cannot change your own role", 400);
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { role } });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "user.role.update",
          resourceType: "user",
          resourceId: id,
          metadata: { role },
        },
      });
    });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
