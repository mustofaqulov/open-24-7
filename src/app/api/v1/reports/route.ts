import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { z } from "zod";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "report", 5, 60)))
      return error("Too many reports", 429);
    const user = await sessionUser();
    const data = z
      .object({
        businessId: z.uuid(),
        kind: z.enum(["HOURS", "CLOSED", "DETAILS"]),
        details: z.string().trim().min(5).max(1000),
      })
      .parse(await request.json());
    const business = await db.business.findFirst({
      where: { id: data.businessId, verification: "VERIFIED" },
    });
    if (!business) return error("Place not found", 404);
    const report = await db.report.create({
      data: { ...data, userId: user?.id },
    });
    return json({ id: report.id, state: report.state }, 201);
  } catch (e) {
    return handleError(e);
  }
}
