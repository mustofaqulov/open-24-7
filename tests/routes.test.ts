import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleRoutesProvider } from "../src/lib/providers";

const original = {
  key: process.env.GOOGLE_ROUTES_SERVER_KEY,
  enabled: process.env.GOOGLE_ROUTES_ENABLED,
  terms: process.env.GOOGLE_MAPS_TERMS_APPROVED,
  browser: process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED,
};
afterEach(() => {
  if (original.key === undefined) delete process.env.GOOGLE_ROUTES_SERVER_KEY;
  else process.env.GOOGLE_ROUTES_SERVER_KEY = original.key;
  if (original.enabled === undefined) delete process.env.GOOGLE_ROUTES_ENABLED;
  else process.env.GOOGLE_ROUTES_ENABLED = original.enabled;
  if (original.terms === undefined) delete process.env.GOOGLE_MAPS_TERMS_APPROVED;
  else process.env.GOOGLE_MAPS_TERMS_APPROVED = original.terms;
  if (original.browser === undefined)
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED;
  else process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED = original.browser;
  vi.unstubAllGlobals();
});

describe("Google Routes adapter", () => {
  it("makes no paid request when disabled", async () => {
    delete process.env.GOOGLE_ROUTES_SERVER_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(
      await new GoogleRoutesProvider().route(
        { lat: 38.86, lng: 65.79 },
        { lat: 38.87, lng: 65.8 },
        "WALK",
      ),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("requests only the route fields used by the UI", async () => {
    process.env.GOOGLE_ROUTES_SERVER_KEY = "test-key";
    process.env.GOOGLE_ROUTES_ENABLED = "true";
    process.env.GOOGLE_MAPS_TERMS_APPROVED = "true";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED = "true";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            distanceMeters: 1400,
            duration: "780s",
            polyline: { encodedPolyline: "abc" },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const route = await new GoogleRoutesProvider().route(
      { lat: 38.86, lng: 65.79 },
      { lat: 38.87, lng: 65.8 },
      "WALK",
    );
    expect(route).toMatchObject({
      distanceMeters: 1400,
      durationSeconds: 780,
      mode: "WALK",
    });
    expect(fetchMock.mock.calls[0][1].headers["X-Goog-FieldMask"]).toBe(
      "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    );
    expect(fetchMock.mock.calls[0][1].cache).toBe("no-store");
  });
});
