import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (user?.role !== "ADMIN") return error("Forbidden", 403);
    const data = z.object({ categoryId: z.uuid(), locale: z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/), name: z.string().trim().min(2).max(80) }).parse(await request.json());
    const translation = await db.$transaction(async (tx) => {
      const record = await tx.categoryTranslation.upsert({ where: { categoryId_locale: { categoryId: data.categoryId, locale: data.locale } }, create: data, update: { name: data.name } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "category.translation.update", resourceType: "category", resourceId: data.categoryId, metadata: { locale: data.locale } } });
      return record;
    });
    return json({ translation });
  } catch (e) { return handleError(e); }
}
