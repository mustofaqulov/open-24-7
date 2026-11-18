import { afterEach, describe, expect, it, vi } from "vitest";
import { NominatimGeocodingProvider } from "../src/lib/geocoding";

afterEach(() => vi.unstubAllGlobals());

describe("configured Nominatim adapter", () => {
  it("rejects the shared public endpoint", () => {
    expect(
      () =>
        new NominatimGeocodingProvider("https://nominatim.openstreetmap.org"),
    ).toThrow("operator-controlled");
  });

  it("requests a bounded Uzbekistan address search and validates coordinates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { lat: "38.8598", lon: "65.7898", display_name: "Qarshi, Uzbekistan" },
        { lat: "200", lon: "0", display_name: "Invalid" },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await new NominatimGeocodingProvider(
      "https://geo.example.org/",
    ).geocode("Qarshi");
    expect(result).toEqual([
      {
        point: { lat: 38.8598, lng: 65.7898 },
        label: "Qarshi, Uzbekistan",
        source: "osm",
      },
    ]);
    const requested = new URL(fetchMock.mock.calls[0][0]);
    expect(requested.pathname).toBe("/search");
    expect(requested.searchParams.get("countrycodes")).toBe("uz");
    expect(requested.searchParams.get("limit")).toBe("5");
  });
});
