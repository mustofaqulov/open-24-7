import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";
export async function GET() {
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const items = await db.favorite.findMany({
      where: { userId: user.id },
      include: {
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return json({ items });
  } catch (e) {
    return handleError(e);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const { businessId } = z
      .object({ businessId: z.uuid() })
      .parse(await request.json());
    const business = await db.business.findFirst({
      where: { id: businessId, verification: "VERIFIED" },
    });
    if (!business) return error("Place not found", 404);
    await db.favorite.upsert({
      where: { userId_businessId: { userId: user.id, businessId } },
      create: { userId: user.id, businessId },
      update: {},
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const { businessId } = z
      .object({ businessId: z.uuid() })
      .parse(await request.json());
    await db.favorite.deleteMany({ where: { userId: user.id, businessId } });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
