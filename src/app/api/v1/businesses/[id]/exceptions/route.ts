import { canEditBusiness, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";

const date = z
  .string()
  .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date");
const schema = z
  .array(
    z.object({
      localDate: date,
      openMinute: z.number().int().min(0).max(1439),
      closeMinute: z.number().int().min(0).max(1440),
      isClosed: z.boolean(),
    }),
  )
  .max(60)
  .superRefine((rows, ctx) => {
    for (const [index, row] of rows.entries()) {
      if (
        row.isClosed &&
        rows.some(
          (other, i) => i !== index && other.localDate === row.localDate,
        )
      )
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: "A closed day cannot have other intervals",
        });
    }
  });

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
    const rows = schema.parse(await request.json());
    await db.$transaction(async (tx) => {
      await tx.businessHourException.deleteMany({ where: { businessId: id } });
      if (rows.length)
        await tx.businessHourException.createMany({
          data: rows.map((row) => ({ ...row, businessId: id })),
        });
      await tx.business.update({
        where: { id },
        data: { hoursSource: "OWNER", hoursVerifiedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "business.exceptions.update",
          resourceType: "business",
          resourceId: id,
          metadata: { count: rows.length },
        },
      });
    });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
