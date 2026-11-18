import { describe, expect, test } from "vitest";
import { decodePolyline } from "../src/lib/polyline";

describe("decodePolyline", () => {
  test("returns an empty list for an empty string", () => {
    expect(decodePolyline("")).toEqual([]);
  });

  test("decodes the reference Google polyline sample", () => {
    const points = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

    expect(points).toEqual([
      { lat: 38.5, lng: -120.2 },
      { lat: 40.7, lng: -120.95 },
      { lat: 43.252, lng: -126.453 },
    ]);
  });

  test("decodes a Qarshi route with five decimal precision", () => {
    const points = decodePolyline("wxdlFgqppKoFwL");

    expect(points).toHaveLength(2);
    expect(points[0].lat).toBeCloseTo(38.8598, 4);
    expect(points[0].lng).toBeCloseTo(65.7898, 4);
    expect(points[1].lat).toBeCloseTo(38.861, 4);
    expect(points[1].lng).toBeCloseTo(65.792, 4);
  });
});
