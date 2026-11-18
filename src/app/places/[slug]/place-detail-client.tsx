"use client";
import { Select } from "@/components/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Heart,
  Clock3,
  Phone,
  Globe,
  Flag,
  LocateFixed,
} from "lucide-react";
import { MapView, MapPoint } from "@/components/map-view";
import { StatusBadge } from "@/components/status-badge";
import { useT } from "@/components/locale";
type Place = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  phone: string | null;
  website: string | null;
  category: { nameEn: string; nameUz: string; nameRu: string };
  status: string;
  alwaysOpen: boolean;
  todaysHours: string;
  nextTransition: { status: string; at: string } | null;
  hoursVerifiedAt: string | null;
  hoursSource: string;
  sources: { provider: string; externalId: string }[];
  hours: {
    weekday: number;
    openMinute: number;
    closeMinute: number;
    isClosed: boolean;
  }[];
};
type Route = {
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  mode: "DRIVE" | "WALK";
};
const cities = [
  { name: "Qarshi", lat: 38.8598, lng: 65.7898 },
  { name: "Tashkent", lat: 41.2995, lng: 69.2401 },
  { name: "Samarkand", lat: 39.6542, lng: 66.9597 },
  { name: "Bukhara", lat: 39.767, lng: 64.423 },
];
export function PlaceDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState<MapPoint | null>(null);
  const [mode, setMode] = useState<"DRIVE" | "WALK">("DRIVE");
  const [route, setRoute] = useState<Route | null>(null);
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportText, setReportText] = useState("");
  useEffect(() => {
    fetch(`/api/v1/places/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || "Place unavailable");
        setPlace(d.place);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);
  const locate = () => {
    if (!navigator.geolocation) {
      setMessage(t.locationDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude });
        setRoute(null);
        setMessage("");
      },
      () => setMessage(t.locationDenied),
      { timeout: 10000, maximumAge: 0 },
    );
  };
  const getRoute = async () => {
    if (!place || !origin) {
      setRouteError(t.locationDenied);
      return;
    }
    setRouteLoading(true);
    setRouteError("");
    try {
      const r = await fetch(`/api/v1/places/${place.id}/directions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, mode }),
        cache: "no-store",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || t.routeUnavailable);
      setRoute(data.route);
    } catch (e) {
      setRouteError((e as Error).message);
    } finally {
      setRouteLoading(false);
    }
  };
  const save = async () => {
    if (!place) return;
    const r = await fetch("/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: place.id }),
    });
    if (r.status === 401) {
      router.push("/login");
      return;
    }
    setMessage(r.ok ? "Saved to favorites" : "Unable to save favorite");
  };
  const report = async () => {
    if (!place) return;
    const r = await fetch("/api/v1/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: place.id,
        kind: "HOURS",
        details: reportText,
      }),
    });
    setMessage(r.ok ? "Report received for review" : "Could not submit report");
    if (r.ok) {
      setReporting(false);
      setReportText("");
    }
  };
  if (loading)
    return (
      <div className="container page-shell">
        <p className="notice">Loading place…</p>
      </div>
    );
  if (error || !place)
    return (
      <div className="container page-shell">
        <p className="notice error-notice">{error || "Place not found"}</p>
      </div>
    );
  const category =
    locale === "uz"
      ? place.category.nameUz
      : locale === "ru"
        ? place.category.nameRu
        : place.category.nameEn;
  const googleLink = `https://www.google.com/maps/search/?api=1&query=${place.latitude}%2C${place.longitude}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude}%2C${place.longitude}${origin ? `&origin=${origin.lat}%2C${origin.lng}` : ""}&travelmode=${mode === "WALK" ? "walking" : "driving"}`;
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">{category}</span>
          <h1>{place.name}</h1>
          <p>
            {place.address}, {place.city}
          </p>
        </div>
        <div className="detail-grid">
          <div className="panel detail-card">
            <StatusBadge status={place.status} alwaysOpen={place.alwaysOpen} />
            <h1>{place.name}</h1>
            {place.description && <p>{place.description}</p>}
            <div className="detail-actions">
              <button className="button button-small" onClick={save}>
                <Heart size={16} />
                {t.favorite}
              </button>
              <a
                className="button button-outline button-small"
                href={directionsLink}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={16} />
                {t.openGoogle}
              </a>
              <button
                className="button button-outline button-small"
                onClick={() => setReporting(!reporting)}
              >
                <Flag size={15} />
                {t.report}
              </button>
              <a
                className="button button-outline button-small"
                href={`/business/claim?businessId=${place.id}`}
              >
                Claim this business
              </a>
            </div>
            <div className="fact-row">
              <strong>
                <MapPin size={15} /> Address
              </strong>
              <span>
                {place.address}, {place.city}
              </span>
            </div>
            <div className="fact-row">
              <strong>
                <Clock3 size={15} /> {t.today}
              </strong>
              <span>{place.todaysHours}</span>
            </div>
            <div className="fact-row">
              <strong>{t.updated}</strong>
              <span>
                {place.hoursVerifiedAt
                  ? new Date(place.hoursVerifiedAt).toLocaleDateString(locale)
                  : t.hoursUnknown}
              </span>
            </div>
            <div className="fact-row">
              <strong>{t.source}</strong>
              <span>
                {place.hoursSource === "OWNER"
                  ? "Business owner"
                  : place.hoursSource === "VERIFIED_SOURCE"
                    ? "Verified source"
                    : t.hoursUnknown}
              </span>
            </div>
            <div className="fact-row">
              <strong>Timezone</strong>
              <span>{place.timezone}</span>
            </div>
            {place.nextTransition && (
              <div className="fact-row">
                <strong>
                  {place.nextTransition.status === "OPEN"
                    ? "Next opening"
                    : "Next closing"}
                </strong>
                <span>
                  {new Date(place.nextTransition.at).toLocaleString(locale, {
                    timeZone: place.timezone,
                  })}
                </span>
              </div>
            )}
            {place.phone && (
              <div className="fact-row">
                <strong>
                  <Phone size={15} /> Phone
                </strong>
                <a href={`tel:${place.phone}`}>{place.phone}</a>
              </div>
            )}
            {place.sources.some((s) => s.provider === "osm") && (
              <div className="fact-row">
                <strong>Data source</strong>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenStreetMap contributors (ODbL)
                </a>
              </div>
            )}
            {place.website && (
              <div className="fact-row">
                <strong>
                  <Globe size={15} /> Website
                </strong>
                <a href={place.website} target="_blank" rel="noreferrer">
                  {place.website}
                </a>
              </div>
            )}
            {reporting && (
              <div className="field">
                <label htmlFor="report-text">{t.report}</label>
                <textarea
                  id="report-text"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={3}
                  minLength={5}
                  maxLength={1000}
                  placeholder="Describe the incorrect hours"
                />
                <button
                  className="button button-small"
                  disabled={reportText.trim().length < 5}
                  onClick={report}
                >
                  Submit report
                </button>
              </div>
            )}
            {message && (
              <p className="notice" role="status">
                {message}
              </p>
            )}
            <hr
              style={{
                border: 0,
                borderTop: "1px solid var(--line)",
                margin: "24px 0",
              }}
            />
            <h2 style={{ fontSize: 21 }}>Plan your route</h2>
            <p>{t.selectPoint}</p>
            <div className="search-actions">
              <button
                className="button button-outline button-small"
                onClick={locate}
              >
                <LocateFixed size={15} />
                {t.useLocation}
              </button>
              <label className="sr-only" htmlFor="route-city">
                {t.manual}
              </label>
              <Select
                id="route-city"
                className="lang-select"
                defaultValue=""
                onChange={(e) => {
                  const city = cities.find((c) => c.name === e.target.value);
                  if (city) {
                    setOrigin({ lat: city.lat, lng: city.lng });
                    setRoute(null);
                  }
                }}
              >
                <option value="">{t.manual}</option>
                {cities.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </Select>
              <label className="sr-only" htmlFor="mode">
                Travel mode
              </label>
              <Select
                id="mode"
                className="lang-select"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as typeof mode);
                  setRoute(null);
                }}
              >
                <option value="DRIVE">{t.driving}</option>
                <option value="WALK">{t.walking}</option>
              </Select>
              <button
                className="button button-small"
                disabled={!origin || routeLoading}
                onClick={getRoute}
              >
                <Navigation size={15} />
                {routeLoading ? "Loading…" : t.route}
              </button>
            </div>
            {route && mode === "WALK" && (
              <p className="notice">
                Walking routes may be missing sidewalks or pedestrian paths.
                Check local conditions.
              </p>
            )}
            {route && (
              <p className="notice" role="status">
                {t.routeDistance}: {(route.distanceMeters / 1000).toFixed(1)} km
                · {t.estimated}: {Math.round(route.durationSeconds / 60)} min ·
                Google Maps
              </p>
            )}
            {routeError && (
              <p className="notice error-notice" role="alert">
                {routeError}{" "}
                <a href={directionsLink} target="_blank" rel="noreferrer">
                  {t.openGoogle}
                </a>
              </p>
            )}
          </div>
          <div>
            <div className="panel detail-map">
              <MapView
                center={origin || { lat: place.latitude, lng: place.longitude }}
                places={[place]}
                selectedId={place.id}
                routePolyline={route?.encodedPolyline}
                onChooseLocation={(point) => {
                  setOrigin(point);
                  setRoute(null);
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
              <a href={googleLink} target="_blank" rel="noreferrer">
                {t.openGoogle}
              </a>{" "}
              · {t.available}
            </p>
          </div>
        </div>
      </div>
      <a
        className="mobile-sticky-action"
        href={directionsLink}
        target="_blank"
        rel="noreferrer"
      >
        <Navigation size={18} aria-hidden="true" />
        {t.openGoogle}
      </a>
    </div>
  );
}
