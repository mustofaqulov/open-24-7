import { searchPlaces } from "@/lib/places";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { searchSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "search", 60)))
      return error("Too many searches", 429);
    const input = searchSchema.parse(await request.json());
    return json(await searchPlaces(input));
  } catch (e) {
    return handleError(e);
  }
}
