export type HoursRow = {
  weekday: number;
  openMinute: number;
  closeMinute: number;
  isClosed: boolean;
};
export type HoursException = Omit<HoursRow, "weekday"> & {
  localDate: string;
};
export type HoursInput = {
  timezone: string;
  temporarilyClosed: boolean;
  hoursSource: string;
  hoursVerifiedAt: Date | null;
  hours: HoursRow[];
  exceptions?: HoursException[];
};
export type OpeningStatus =
  "OPEN" | "CLOSED" | "UNKNOWN" | "TEMPORARILY_CLOSED";
const formatters = new Map<string, Intl.DateTimeFormat>();
function localParts(at: Date, tz: string) {
  let formatter = formatters.get(tz);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(tz, formatter);
  }
  const parts = formatter.formatToParts(at);
  const v = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    weekday: weekdays.indexOf(v("weekday")),
    minute: Number(v("hour")) * 60 + Number(v("minute")),
    date: `${v("year")}-${v("month")}-${v("day")}`,
  };
}
function previousDate(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}
function schedule(place: HoursInput, date: string, weekday: number) {
  const exception = place.exceptions?.filter((h) => h.localDate === date);
  return exception?.length
    ? exception
    : place.hours.filter((h) => h.weekday === weekday);
}
export function openingStatus(
  place: HoursInput,
  at = new Date(),
): OpeningStatus {
  if (place.temporarilyClosed) return "TEMPORARILY_CLOSED";
  if (
    !place.hours.length ||
    new Set(place.hours.map((h) => h.weekday)).size !== 7 ||
    !place.hoursVerifiedAt ||
    place.hoursSource === "UNVERIFIED" ||
    place.hoursSource === "OSM" ||
    at.getTime() - place.hoursVerifiedAt.getTime() > 180 * 86400000
  )
    return "UNKNOWN";
  try {
    const { weekday, minute, date } = localParts(at, place.timezone);
    if (weekday < 0) return "UNKNOWN";
    const today = schedule(place, date, weekday);
    if (place.exceptions?.some((h) => h.localDate === date && h.isClosed))
      return "CLOSED";
    for (const h of today) {
      if (h.isClosed) continue;
      if (
        h.closeMinute > h.openMinute
          ? minute >= h.openMinute && minute < h.closeMinute
          : minute >= h.openMinute
      )
        return "OPEN";
    }
    for (const h of schedule(place, previousDate(date), (weekday + 6) % 7)) {
      if (
        !h.isClosed &&
        h.closeMinute <= h.openMinute &&
        minute < h.closeMinute
      )
        return "OPEN";
    }
    return "CLOSED";
  } catch {
    return "UNKNOWN";
  }
}
export function isAlwaysOpen(place: HoursInput, at = new Date()) {
  if (openingStatus(place, at) === "UNKNOWN" || place.temporarilyClosed)
    return false;
  try {
    const today = localParts(at, place.timezone).date;
    if (place.exceptions?.some((h) => h.localDate >= today)) return false;
  } catch {
    return false;
  }
  return [0, 1, 2, 3, 4, 5, 6].every((day) =>
    place.hours.some(
      (h) =>
        h.weekday === day &&
        !h.isClosed &&
        h.openMinute === 0 &&
        h.closeMinute === 1440,
    ),
  );
}
export function nextTransition(place: HoursInput, at = new Date()) {
  const initial = openingStatus(place, at);
  if (
    initial === "UNKNOWN" ||
    initial === "TEMPORARILY_CLOSED" ||
    isAlwaysOpen(place, at)
  )
    return null;
  const start = Math.floor(at.getTime() / 60000) * 60000;
  for (let i = 1; i <= 8 * 24 * 60; i++) {
    const next = new Date(start + i * 60000);
    const status = openingStatus(place, next);
    if (status !== initial) return { status, at: next };
  }
  return null;
}
export function todaysHours(place: HoursInput, at = new Date()) {
  try {
    if (openingStatus(place, at) === "UNKNOWN") return "Hours unverified";
    if (isAlwaysOpen(place, at)) return "Open 24/7";
    const { weekday: day, date } = localParts(at, place.timezone);
    const clock = (minute: number) =>
      `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    if (place.exceptions?.some((h) => h.localDate === date && h.isClosed))
      return "Closed today";
    const carry = schedule(place, previousDate(date), (day + 6) % 7)
      .filter(
        (h) =>
          !h.isClosed && h.closeMinute <= h.openMinute && h.closeMinute > 0,
      )
      .map((h) => `00:00–${clock(h.closeMinute)} (from yesterday)`);
    const today = schedule(place, date, day)
      .filter((h) => !h.isClosed)
      .map(
        (h) =>
          `${clock(h.openMinute)}–${clock(h.closeMinute)}${h.closeMinute <= h.openMinute ? " +1" : ""}`,
      );
    return [...carry, ...today].join(", ") || "Closed today";
  } catch {
    return "Hours unverified";
  }
}
