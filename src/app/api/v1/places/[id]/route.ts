import { db } from "@/lib/db";
import { handleError, json, error } from "@/lib/http";
import {
  openingStatus,
  isAlwaysOpen,
  nextTransition,
  todaysHours,
} from "@/lib/hours";
import { z } from "zod";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const b = await db.business.findFirst({
      where: z.uuid().safeParse(id).success
        ? { id, verification: "VERIFIED" }
        : { slug: id, verification: "VERIFIED" },
      include: {
        category: { include: { translations: true } },
        hours: true,
        exceptions: true,
        sources: { select: { provider: true, externalId: true } },
      },
    });
    if (!b) return error("Place not found", 404);
    return json({
      place: {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        address: b.address,
        city: b.city,
        latitude: b.latitude,
        longitude: b.longitude,
        timezone: b.timezone,
        phone: b.phone,
        website: b.website,
        category: b.category,
        status: openingStatus(b),
        alwaysOpen: isAlwaysOpen(b),
        todaysHours: todaysHours(b),
        nextTransition: nextTransition(b),
        hoursVerifiedAt: b.hoursVerifiedAt,
        hoursSource: b.hoursSource,
        sources: b.sources,
        hours: b.hours.map((h) => ({
          weekday: h.weekday,
          openMinute: h.openMinute,
          closeMinute: h.closeMinute,
          isClosed: h.isClosed,
        })),
        exceptions: b.exceptions.map((h) => ({
          localDate: h.localDate,
          openMinute: h.openMinute,
          closeMinute: h.closeMinute,
          isClosed: h.isClosed,
        })),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
