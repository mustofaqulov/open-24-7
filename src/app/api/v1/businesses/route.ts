import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessSchema } from "@/lib/validation";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
export async function GET() {
  try {
    const user = await sessionUser();
    if (!user) return error("Sign in required", 401);
    const items = await db.ownership.findMany({
      where: { userId: user.id },
      include: { business: { include: { category: true } } },
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
    if (!(await rateLimit(request, "business", 5, 60)))
      return error("Too many submissions", 429);
    const data = businessSchema.parse(await request.json());
    try {
      new Intl.DateTimeFormat("en", { timeZone: data.timezone });
    } catch {
      return error("Invalid timezone", 400);
    }
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) return error("Category not found", 404);
    const slug = `${
      data.name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "place"
    }-${crypto.randomUUID().slice(0, 8)}`;
    const business = await db.$transaction(async (tx) => {
      const b = await tx.business.create({
        data: { ...data, slug, categoryId: data.categoryId },
      });
      await tx.ownership.create({
        data: {
          businessId: b.id,
          userId: user.id,
          evidence: "New business submission",
        },
      });
      return b;
    });
    return json(
      {
        id: business.id,
        slug: business.slug,
        verification: business.verification,
      },
      201,
    );
  } catch (e) {
    return handleError(e);
  }
}
