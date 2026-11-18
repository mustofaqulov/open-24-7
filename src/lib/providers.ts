export type Point = { lat: number; lng: number };
export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  provider: "google";
  mode: "DRIVE" | "WALK";
};
export interface DirectionsProvider {
  route(
    origin: Point,
    destination: Point,
    mode: "DRIVE" | "WALK",
  ): Promise<RouteResult | null>;
}
export interface PlaceProvider {
  search(query: string, center: Point, radiusKm: number): Promise<unknown[]>;
  details(id: string): Promise<unknown | null>;
}
export type GeocodeMatch = { point: Point; label: string; source: "osm" };
export interface GeocodingProvider {
  /** `near` biases results towards the visitor's current map centre. */
  geocode(query: string, near?: Point): Promise<GeocodeMatch[]>;
  reverse(point: Point): Promise<string | null>;
}
export class GoogleRoutesProvider implements DirectionsProvider {
  async route(
    origin: Point,
    destination: Point,
    mode: "DRIVE" | "WALK",
  ): Promise<RouteResult | null> {
    const key = process.env.GOOGLE_ROUTES_SERVER_KEY;
    if (
      !key ||
      process.env.GOOGLE_ROUTES_ENABLED !== "true" ||
      process.env.GOOGLE_MAPS_TERMS_APPROVED !== "true" ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED !== "true"
    )
      return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: { latitude: origin.lat, longitude: origin.lng },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            travelMode: mode,
            computeAlternativeRoutes: false,
            units: "METRIC",
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
      if (!response.ok)
        throw new Error(`Google Routes HTTP ${response.status}`);
      const data = (await response.json()) as {
        routes?: {
          distanceMeters: number;
          duration: string;
          polyline?: { encodedPolyline: string };
        }[];
      };
      const route = data.routes?.[0];
      if (!route?.polyline?.encodedPolyline) return null;
      const durationSeconds = Number.parseFloat(route.duration);
      if (
        !Number.isFinite(route.distanceMeters) ||
        route.distanceMeters < 0 ||
        !Number.isFinite(durationSeconds) ||
        durationSeconds < 0
      )
        return null;
      return {
        distanceMeters: route.distanceMeters,
        durationSeconds,
        encodedPolyline: route.polyline.encodedPolyline,
        provider: "google",
        mode,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
