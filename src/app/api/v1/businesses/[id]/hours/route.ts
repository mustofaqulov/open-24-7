import { canEditBusiness, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hoursSchema } from "@/lib/validation";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function PUT(
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
    const hours = hoursSchema.parse(await request.json());
    await db.$transaction(async (tx) => {
      await tx.businessHour.deleteMany({ where: { businessId: id } });
      if (hours.length)
        await tx.businessHour.createMany({
          data: hours.map((h) => ({ ...h, businessId: id })),
        });
      await tx.business.update({
        where: { id },
        data: { hoursSource: "OWNER", hoursVerifiedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "business.hours.update",
          resourceType: "business",
          resourceId: id,
        },
      });
    });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
