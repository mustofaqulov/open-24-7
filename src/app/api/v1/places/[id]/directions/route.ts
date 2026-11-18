import { db } from "@/lib/db";
import { GoogleRoutesProvider } from "@/lib/providers";
import { coordinates } from "@/lib/validation";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { z } from "zod";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "routes", 15, 15)))
      return error("Route request limit reached", 429);
    const id = z.uuid().parse((await params).id);
    const place = await db.business.findFirst({
      where: { id, verification: "VERIFIED" },
      select: { latitude: true, longitude: true },
    });
    if (!place) return error("Place not found", 404);
    const body = z
      .object({
        origin: coordinates,
        mode: z.enum(["DRIVE", "WALK"]).default("DRIVE"),
      })
      .parse(await request.json());
    if (
      !process.env.GOOGLE_ROUTES_SERVER_KEY ||
      process.env.GOOGLE_ROUTES_ENABLED !== "true" ||
      process.env.GOOGLE_MAPS_TERMS_APPROVED !== "true" ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED !== "true"
    )
      return error("Routes are not configured", 503);
    const route = await new GoogleRoutesProvider().route(
      body.origin,
      { lat: place.latitude, lng: place.longitude },
      body.mode,
    );
    if (!route) return error("No route available", 404);
    return json({ route });
  } catch (e) {
    return handleError(e);
  }
}
