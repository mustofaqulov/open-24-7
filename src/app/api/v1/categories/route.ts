import { db } from "@/lib/db";
import { handleError, json } from "@/lib/http";
export async function GET() {
  try {
    return json({
      items: await db.category.findMany({
        include: { translations: true },
        orderBy: { nameEn: "asc" },
      }),
    });
  } catch (e) {
    return handleError(e);
  }
}
