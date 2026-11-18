import { describe, it, expect } from "vitest";
import {
  openingStatus,
  isAlwaysOpen,
  nextTransition,
  todaysHours,
  type HoursInput,
} from "../src/lib/hours";
const base: HoursInput = {
  timezone: "Asia/Tashkent",
  temporarilyClosed: false,
  hoursSource: "OWNER",
  hoursVerifiedAt: new Date("2026-10-12T00:00:00Z"),
  hours: Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    openMinute: 540,
    closeMinute: 1080,
    isClosed: weekday !== 1,
  })),
};
describe("opening hours", () => {
  it("uses business timezone rather than server timezone", () => {
    expect(openingStatus(base, new Date("2026-10-12T04:30:00Z"))).toBe("OPEN");
    expect(openingStatus(base, new Date("2026-10-12T02:00:00Z"))).toBe(
      "CLOSED",
    );
  });
  it("handles an overnight schedule across weekdays", () => {
    const place = {
      ...base,
      hours: base.hours.map((h) =>
        h.weekday === 1 ? { ...h, openMinute: 1320, closeMinute: 120 } : h,
      ),
    };
    expect(openingStatus(place, new Date("2026-10-12T18:00:00Z"))).toBe("OPEN");
    expect(openingStatus(place, new Date("2026-10-12T20:30:00Z"))).toBe("OPEN");
    expect(openingStatus(place, new Date("2026-10-12T21:30:00Z"))).toBe(
      "CLOSED",
    );
  });
  it("never calls stale or missing hours open", () => {
    expect(
      openingStatus(
        { ...base, hours: base.hours.slice(0, 6) },
        new Date("2026-10-12T04:30:00Z"),
      ),
    ).toBe("UNKNOWN");
    expect(
      openingStatus(
        { ...base, hoursVerifiedAt: null },
        new Date("2026-10-12T04:30:00Z"),
      ),
    ).toBe("UNKNOWN");
    expect(
      openingStatus(
        { ...base, hoursSource: "OSM" },
        new Date("2026-10-12T04:30:00Z"),
      ),
    ).toBe("UNKNOWN");
    expect(
      openingStatus(
        { ...base, hoursVerifiedAt: new Date("2025-01-01") },
        new Date("2026-10-12T04:30:00Z"),
      ),
    ).toBe("UNKNOWN");
  });
  it("prioritizes temporary closures", () =>
    expect(
      openingStatus(
        { ...base, temporarilyClosed: true },
        new Date("2026-10-12T04:30:00Z"),
      ),
    ).toBe("TEMPORARILY_CLOSED"));
  it("shows 24/7 only with seven full-day rows", () => {
    const place = {
      ...base,
      hoursVerifiedAt: new Date(),
      hours: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        openMinute: 0,
        closeMinute: 1440,
        isClosed: false,
      })),
    };
    expect(isAlwaysOpen(place)).toBe(true);
    expect(isAlwaysOpen(base)).toBe(false);
  });
  it("calculates today and the next transition", () => {
    expect(todaysHours(base, new Date("2026-10-12T05:00:00Z"))).toBe(
      "09:00–18:00",
    );
    const transition = nextTransition(base, new Date("2026-10-12T05:00:00Z"));
    expect(transition?.status).toBe("CLOSED");
    expect(transition?.at.getUTCHours()).toBe(13);
  });
  it("shows overnight hours on the following local day", () => {
    const place = {
      ...base,
      hours: base.hours.map((h) =>
        h.weekday === 1 ? { ...h, openMinute: 1320, closeMinute: 120 } : h,
      ),
    };
    expect(todaysHours(place, new Date("2026-10-12T20:30:00Z"))).toContain(
      "from yesterday",
    );
  });
  it("observes daylight saving changes in other countries", () => {
    const p = {
      ...base,
      timezone: "Europe/London",
      hoursVerifiedAt: new Date("2026-03-01"),
      hours: base.hours.map((h) =>
        h.weekday === 0
          ? { ...h, openMinute: 90, closeMinute: 180, isClosed: false }
          : h,
      ),
    };
    expect(openingStatus(p, new Date("2026-03-29T00:45:00Z"))).toBe("CLOSED");
    expect(openingStatus(p, new Date("2026-03-29T01:45:00Z"))).toBe("OPEN");
  });
  it("applies date-specific closure in the business timezone", () => {
    const place = {
      ...base,
      exceptions: [
        {
          localDate: "2026-10-12",
          openMinute: 0,
          closeMinute: 0,
          isClosed: true,
        },
      ],
    };
    expect(openingStatus(place, new Date("2026-10-12T04:30:00Z"))).toBe(
      "CLOSED",
    );
    expect(todaysHours(place, new Date("2026-10-12T04:30:00Z"))).toBe(
      "Closed today",
    );
  });
  it("uses special opening intervals and does not call them 24/7", () => {
    const place = {
      ...base,
      hours: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        openMinute: 0,
        closeMinute: 1440,
        isClosed: false,
      })),
      exceptions: [
        {
          localDate: "2026-10-12",
          openMinute: 600,
          closeMinute: 720,
          isClosed: false,
        },
      ],
    };
    expect(openingStatus(place, new Date("2026-10-12T04:30:00Z"))).toBe(
      "CLOSED",
    );
    expect(openingStatus(place, new Date("2026-10-12T05:30:00Z"))).toBe("OPEN");
    expect(isAlwaysOpen(place, new Date("2026-10-12T05:30:00Z"))).toBe(false);
  });
});
