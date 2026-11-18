import { createGeocodingProvider } from "@/lib/geocoding";
import { rateLimit } from "@/lib/rate";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  query: z.string().trim().min(3).max(120),
  // Optional map centre; results near it are ranked first.
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "geocode", 10, 15)))
      return error("Address search limit reached", 429);
    const { query, lat, lng } = schema.parse(await request.json());
    const near =
      typeof lat === "number" && typeof lng === "number"
        ? { lat, lng }
        : undefined;
    const items = await createGeocodingProvider().geocode(query, near);
    return json({ items, attribution: "© OpenStreetMap contributors" });
  } catch (e) {
    return handleError(e);
  }
}
