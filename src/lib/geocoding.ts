import type { GeocodeMatch, GeocodingProvider, Point } from "./providers";

/** Public Photon service, used when no operator endpoint is configured. */
export const DEFAULT_PHOTON_BASE_URL = "https://photon.komoot.io";
/** Uzbekistan bounding box, used to keep matches inside the served country. */
const COUNTRY_VIEWBOX = { west: 55.9, south: 37.1, east: 73.2, north: 45.6 };
const REQUEST_TIMEOUT_MS = 5000;
const MATCH_LIMIT = 5;

type NominatimPlace = { lat?: string; lon?: string; display_name?: string };
type PhotonFeature = {
  geometry?: { coordinates?: unknown };
  properties?: Record<string, unknown>;
};

function countryCodes(): string[] {
  const configured = process.env.GEOCODING_COUNTRY_CODES || "uz";
  if (!/^[a-z]{2}(,[a-z]{2})*$/.test(configured))
    throw new Error("Invalid geocoding country configuration");
  return configured.split(",");
}

function validBaseUrl(baseUrl: string): URL {
  const url = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (url.username || url.password || url.search || url.hash)
    throw new Error("Geocoding endpoint must be a plain base URL");
  if (
    url.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("Geocoding endpoint must use HTTPS");
  return url;
}

async function requestJson(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Open24/0.1 (configured geocoding service)",
        "Accept-Language": "uz,en,ru",
      },
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

function validPoint(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export class NominatimGeocodingProvider implements GeocodingProvider {
  private base: URL;

  constructor(baseUrl = process.env.NOMINATIM_BASE_URL) {
    if (!baseUrl) throw new Error("Geocoding provider is not configured");
    const url = validBaseUrl(baseUrl);
    if (url.hostname === "nominatim.openstreetmap.org")
      throw new Error(
        "Use an operator-controlled or contracted Nominatim endpoint",
      );
    this.base = url;
  }

  private url(path: string, params: Record<string, string>): URL {
    const url = new URL(path, this.base);
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);
    return url;
  }

  async geocode(query: string, near?: Point): Promise<GeocodeMatch[]> {
    const params: Record<string, string> = {
      q: query,
      format: "jsonv2",
      limit: String(MATCH_LIMIT),
      countrycodes: countryCodes().join(","),
      addressdetails: "0",
    };
    // A viewbox ranks addresses around the visitor's map centre first.
    if (near && validPoint(near.lat, near.lng))
      params.viewbox = [
        near.lng - 0.5,
        near.lat + 0.5,
        near.lng + 0.5,
        near.lat - 0.5,
      ].join(",");
    const data = await requestJson(this.url("search", params));
    if (!Array.isArray(data)) return [];
    return (data as NominatimPlace[]).slice(0, MATCH_LIMIT).flatMap((item) => {
      if (!item.lat?.trim() || !item.lon?.trim()) return [];
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      if (!validPoint(lat, lng) || typeof item.display_name !== "string")
        return [];
      return [
        {
          point: { lat, lng },
          label: item.display_name.slice(0, 250),
          source: "osm" as const,
        },
      ];
    });
  }

  async reverse(point: Point): Promise<string | null> {
    const data = (await requestJson(
      this.url("reverse", {
        lat: String(point.lat),
        lon: String(point.lng),
        format: "jsonv2",
        zoom: "18",
        addressdetails: "0",
      }),
    )) as NominatimPlace;
    return typeof data?.display_name === "string"
      ? data.display_name.slice(0, 250)
      : null;
  }
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Builds a readable address from the Photon property set. */
function photonLabel(properties: Record<string, unknown>): string {
  const street = text(properties.street);
  const houseNumber = text(properties.housenumber);
  const line = street && houseNumber ? `${street} ${houseNumber}` : street;
  const parts = [
    text(properties.name),
    line,
    text(properties.district),
    text(properties.city) || text(properties.county),
    text(properties.state),
    text(properties.country),
  ].filter((part): part is string => Boolean(part));
  return [...new Set(parts)].join(", ").slice(0, 250);
}

export class PhotonGeocodingProvider implements GeocodingProvider {
  private base: URL;

  constructor(
    baseUrl = process.env.PHOTON_BASE_URL || DEFAULT_PHOTON_BASE_URL,
  ) {
    this.base = validBaseUrl(baseUrl);
  }

  async geocode(query: string, near?: Point): Promise<GeocodeMatch[]> {
    const allowed = countryCodes().map((code) => code.toUpperCase());
    const url = new URL("api", this.base);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(MATCH_LIMIT * 4));
    url.searchParams.set("lang", "en");
    url.searchParams.set(
      "bbox",
      [
        COUNTRY_VIEWBOX.west,
        COUNTRY_VIEWBOX.south,
        COUNTRY_VIEWBOX.east,
        COUNTRY_VIEWBOX.north,
      ].join(","),
    );
    // Photon ranks results near this point first, so a street name resolves
    // to the one in the visitor's own city rather than another region.
    if (near && validPoint(near.lat, near.lng)) {
      url.searchParams.set("lat", String(near.lat));
      url.searchParams.set("lon", String(near.lng));
    }
    const data = (await requestJson(url)) as { features?: unknown };
    if (!Array.isArray(data?.features)) return [];
    const matches: GeocodeMatch[] = [];
    for (const feature of data.features as PhotonFeature[]) {
      const coordinates = feature?.geometry?.coordinates;
      const properties = feature?.properties;
      if (!Array.isArray(coordinates) || !properties) continue;
      const lng = Number(coordinates[0]);
      const lat = Number(coordinates[1]);
      if (!validPoint(lat, lng)) continue;
      const country = text(properties.countrycode)?.toUpperCase();
      // The bbox is a ranking hint only, so matches outside the served
      // countries are dropped instead of being shown as the wrong place.
      if (country && !allowed.includes(country)) continue;
      const label = photonLabel(properties);
      if (!label) continue;
      matches.push({ point: { lat, lng }, label, source: "osm" });
      if (matches.length === MATCH_LIMIT) break;
    }
    return matches;
  }

  async reverse(point: Point): Promise<string | null> {
    const url = new URL("reverse", this.base);
    url.searchParams.set("lat", String(point.lat));
    url.searchParams.set("lon", String(point.lng));
    url.searchParams.set("lang", "en");
    const data = (await requestJson(url)) as { features?: unknown };
    if (!Array.isArray(data?.features)) return null;
    const properties = (data.features as PhotonFeature[])[0]?.properties;
    if (!properties) return null;
    return photonLabel(properties) || null;
  }
}

/**
 * Address lookup provider: an operator-controlled Nominatim endpoint when one
 * is configured, otherwise Photon, which needs no account.
 */
export function createGeocodingProvider(): GeocodingProvider {
  if (process.env.NOMINATIM_BASE_URL) return new NominatimGeocodingProvider();
  return new PhotonGeocodingProvider();
}
