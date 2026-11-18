import { canModerate, sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
import { canReview } from "@/lib/permissions";
class ReviewConflict extends Error {}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user || !canModerate(user.role)) return error("Forbidden", 403);
    const data = z
      .object({
        kind: z.enum(["business", "claim", "report"]),
        id: z.uuid(),
        decision: z.enum(["approve", "reject"]),
        note: z.string().trim().max(1000).optional(),
      })
      .parse(await request.json());
    if (!canReview(user.role, data.kind))
      return error("Administrator required", 403);
    if (
      (data.kind === "claim" || data.kind === "business") &&
      data.decision === "approve" &&
      (!data.note || data.note.length < 20)
    )
      return error(
        "Record the independent verification method and result",
        400,
      );
    await db.$transaction(async (tx) => {
      if (data.kind === "business") {
        const updated = await tx.business.updateMany({
          where: { id: data.id, verification: "PENDING" },
          data: {
            verification: data.decision === "approve" ? "VERIFIED" : "REJECTED",
          },
        });
        if (updated.count !== 1) throw new ReviewConflict();
      }
      if (data.kind === "claim") {
        const updated = await tx.ownership.updateMany({
          where: { id: data.id, status: "PENDING" },
          data: {
            status: data.decision === "approve" ? "VERIFIED" : "REJECTED",
          },
        });
        if (updated.count !== 1) throw new ReviewConflict();
        const claim = await tx.ownership.findUniqueOrThrow({
          where: { id: data.id },
          select: { userId: true },
        });
        if (data.decision === "approve")
          await tx.user.updateMany({
            where: { id: claim.userId, role: "USER" },
            data: { role: "OWNER" },
          });
      }
      if (data.kind === "report") {
        const updated = await tx.report.updateMany({
          where: { id: data.id, state: "PENDING" },
          data: {
            state: data.decision === "approve" ? "RESOLVED" : "REJECTED",
          },
        });
        if (updated.count !== 1) throw new ReviewConflict();
      }
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: `${data.kind}.${data.decision}`,
          resourceType: data.kind,
          resourceId: data.id,
          metadata: data.note ? { note: data.note } : undefined,
        },
      });
    });
    return json({ ok: true });
  } catch (e) {
    if (e instanceof ReviewConflict)
      return error("Already reviewed or not found", 409);
    return handleError(e);
  }
}
