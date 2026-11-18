import { canEditBusiness, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessSchema } from "@/lib/validation";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const id = z.uuid().parse((await params).id);
    if (!(await canEditBusiness(user.id, user.role, id)))
      return error("Forbidden", 403);
    const data = businessSchema
      .partial()
      .omit({ latitude: true, longitude: true, categoryId: true })
      .extend({ temporarilyClosed: z.boolean().optional() })
      .parse(await request.json());
    if (data.timezone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: data.timezone });
      } catch {
        return error("Invalid timezone", 400);
      }
    }
    const current = await db.business.findUnique({ where: { id } });
    if (!current) return error("Business not found", 404);
    const needsReview =
      user.role !== "ADMIN" &&
      (["name", "address", "city"] as const).some(
        (key) => data[key] !== undefined && data[key] !== current[key],
      );
    const b = await db.$transaction(async (tx) => {
      const updated = await tx.business.update({
        where: { id },
        data: {
          ...data,
          ...(needsReview ? { verification: "PENDING" as const } : {}),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "business.update",
          resourceType: "business",
          resourceId: id,
          metadata: { needsReview },
        },
      });
      return updated;
    });
    return json({
      id: b.id,
      updatedAt: b.updatedAt,
      verification: b.verification,
    });
  } catch (e) {
    return handleError(e);
  }
}
