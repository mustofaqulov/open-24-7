import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "contact", 5, 60)))
      return error("Too many messages", 429);
    const data = z
      .object({
        name: z.string().trim().min(2).max(80),
        email: z.email().max(255),
        message: z.string().trim().min(10).max(2000),
      })
      .parse(await request.json());
    await db.contactMessage.create({ data });
    return json({ ok: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}
