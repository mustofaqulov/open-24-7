import { sessionUser, deleteSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const data = z
      .object({
        displayName: z.string().trim().min(2).max(80).optional(),
        locale: z.enum(["uz", "en", "ru"]).optional(),
      })
      .parse(await request.json());
    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: { id: true, displayName: true, locale: true },
    });
    return json({ user: updated });
  } catch (e) {
    return handleError(e);
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    await db.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "account.delete",
          resourceType: "user",
          resourceId: user.id,
        },
      });
      await tx.user.delete({ where: { id: user.id } });
    });
    await deleteSession();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
