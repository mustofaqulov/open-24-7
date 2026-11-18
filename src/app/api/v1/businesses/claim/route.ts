import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { z } from "zod";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    if (!(await rateLimit(request, "claim", 5, 60)))
      return error("Too many requests", 429);
    const data = z
      .object({
        businessId: z.uuid(),
        evidence: z.string().trim().min(20).max(1000),
      })
      .parse(await request.json());
    const place = await db.business.findFirst({
      where: { id: data.businessId, verification: "VERIFIED" },
    });
    if (!place) return error("Place not found", 404);
    const claim = await db.ownership.upsert({
      where: {
        userId_businessId: { userId: user.id, businessId: data.businessId },
      },
      create: { userId: user.id, ...data },
      update: { evidence: data.evidence, status: "PENDING" },
    });
    return json({ id: claim.id, status: claim.status }, 201);
  } catch (e) {
    return handleError(e);
  }
}
