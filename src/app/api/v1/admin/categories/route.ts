import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
const schema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{1,39}$/),
  nameUz: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
  nameRu: z.string().trim().min(2).max(80),
  parentId: z.uuid().nullable().optional(),
});
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (user?.role !== "ADMIN") return error("Forbidden", 403);
    const data = schema.parse(await request.json());
    const category = await db.$transaction(async (tx) => {
      const c = await tx.category.create({ data });
      await tx.categoryTranslation.createMany({
        data: [
          { categoryId: c.id, locale: "uz", name: c.nameUz },
          { categoryId: c.id, locale: "en", name: c.nameEn },
          { categoryId: c.id, locale: "ru", name: c.nameRu },
        ],
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "category.create",
          resourceType: "category",
          resourceId: c.id,
        },
      });
      return c;
    });
    return json({ category }, 201);
  } catch (e) {
    return handleError(e);
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (user?.role !== "ADMIN") return error("Forbidden", 403);
    const data = schema
      .omit({ key: true })
      .partial()
      .extend({ id: z.uuid() })
      .parse(await request.json());
    const { id, ...update } = data;
    const category = await db.$transaction(async (tx) => {
      const c = await tx.category.update({ where: { id }, data: update });
      for (const [locale, name] of [
        ["uz", update.nameUz],
        ["en", update.nameEn],
        ["ru", update.nameRu],
      ] as const) {
        if (name)
          await tx.categoryTranslation.upsert({
            where: { categoryId_locale: { categoryId: id, locale } },
            create: { categoryId: id, locale, name },
            update: { name },
          });
      }
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "category.update",
          resourceType: "category",
          resourceId: id,
        },
      });
      return c;
    });
    return json({ category });
  } catch (e) {
    return handleError(e);
  }
}
