"use client";
import { RadiusControl } from "@/components/radius-control";
import { Checkbox } from "@/components/checkbox";
import { Select } from "@/components/select";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LocateFixed,
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { MapView, MapPoint } from "@/components/map-view";
import { PlaceCard, PlaceSummary } from "@/components/place-card";
import { useT } from "@/components/locale";
const cities = [
  { key: "Qarshi", lat: 38.8598, lng: 65.7898 },
  { key: "Tashkent", lat: 41.2995, lng: 69.2401 },
  { key: "Samarkand", lat: 39.6542, lng: 66.9597 },
  { key: "Bukhara", lat: 39.767, lng: 64.423 },
];
type Result = {
  items: PlaceSummary[];
  total: number;
  page: number;
  limit: number;
  truncated: boolean;
  distanceType: string;
};
export function ExploreClient({
  initialQuery,
  initialCategory,
  initialOpen,
  initialAlwaysOpen = false,
  initialRadius = 10,
}: {
  initialQuery: string;
  initialCategory: string;
  initialOpen: boolean;
  initialAlwaysOpen?: boolean;
  initialRadius?: number;
}) {
  const { t, locale } = useT();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [openNow, setOpenNow] = useState(initialOpen);
  const [alwaysOpen, setAlwaysOpen] = useState(initialAlwaysOpen);
  const initialCity =
    cities.find(
      (item) => item.key.toLowerCase() === initialQuery.trim().toLowerCase(),
    ) || cities[0];
  const [city, setCity] = useState(initialCity.key);
  const [center, setCenter] = useState<MapPoint>({
    lat: initialCity.lat,
    lng: initialCity.lng,
  });
  const [radius, setRadius] = useState(initialRadius);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [alternatives, setAlternatives] = useState<PlaceSummary[]>([]);
  const [categories, setCategories] = useState<
    {
      id: string;
      key: string;
      nameUz: string;
      nameEn: string;
      nameRu: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const addressRequest = useRef<AbortController | null>(null);
  const [addressMatches, setAddressMatches] = useState<
    { point: MapPoint; label: string; source: "osm" }[]
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  useEffect(() => {
    addressRequest.current?.abort();
    setAddressLoading(false);
    setAddressMatches([]);
    return () => addressRequest.current?.abort();
  }, [center, addressQuery]);
  function clearAddress() {
    addressRequest.current?.abort();
    setSelectedAddress("");
    setAddressQuery("");
    setAddressMatches([]);
    setLocationNote("");
  }
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("open24-pending-location");
      if (!pending) return;
      sessionStorage.removeItem("open24-pending-location");
      const point = JSON.parse(pending) as MapPoint;
      if (
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng) &&
        Math.abs(point.lat) <= 90 &&
        Math.abs(point.lng) <= 180
      ) {
        setCenter(point);
        setCity("custom");
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    try {
      const previous = JSON.parse(
        sessionStorage.getItem("open24-recent-terms") || "[]",
      ) as string[];
      sessionStorage.setItem(
        "open24-recent-terms",
        JSON.stringify(
          [
            debouncedQuery.trim(),
            ...previous.filter((item) => item !== debouncedQuery.trim()),
          ].slice(0, 10),
        ),
      );
    } catch {}
  }, [debouncedQuery]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError("");
      const body = {
        lat: center.lat,
        lng: center.lng,
        radius,
        page,
        limit: 12,
        openNow: String(openNow),
        alwaysOpen: String(alwaysOpen),
        q: debouncedQuery.trim() || undefined,
        category: category || undefined,
      };
      const search = (payload: typeof body) =>
        fetch("/api/v1/places/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      try {
        const response = await search(body);
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error?.message || "Search unavailable");
        setResult(data);
        if (openNow && data.total === 0) {
          const alternative = await search({
            ...body,
            openNow: "false",
            page: 1,
          }).then((r) => r.json());
          setAlternatives(alternative.items || []);
        } else setAlternatives([]);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [
    center,
    debouncedQuery,
    category,
    openNow,
    alwaysOpen,
    radius,
    page,
    revision,
  ]);
  const chooseCity = (name: string) => {
    const place = cities.find((c) => c.key === name);
    if (place) {
      clearAddress();
      setCity(name);
      setCenter({ lat: place.lat, lng: place.lng });
      setPage(1);
      setLocationNote("");
    }
  };
  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote(t.locationDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearAddress();
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCity("custom");
        setPage(1);
        setLocationNote("");
      },
      () => setLocationNote(t.locationDenied),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };
  const searchAddress = async () => {
    if (addressQuery.trim().length < 3) {
      setLocationNote("Enter at least three characters for an address.");
      return;
    }
    setAddressLoading(true);
    setLocationNote("");
    setAddressMatches([]);
    addressRequest.current?.abort();
    const controller = new AbortController();
    addressRequest.current = controller;
    try {
      const response = await fetch("/api/v1/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: addressQuery.trim(),
          lat: center.lat,
          lng: center.lng,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok)
        throw new Error(data.error?.message || "Address search unavailable");
      setAddressMatches(data.items || []);
      if (!data.items?.length)
        setLocationNote(
          "No matching address found. Choose a city or the map instead.",
        );
    } catch (e) {
      if (!controller.signal.aborted) setLocationNote((e as Error).message);
    } finally {
      if (!controller.signal.aborted) setAddressLoading(false);
    }
  };
  const selectMarker = useCallback(
    (id: string) => {
      const place = result?.items.find((item) => item.id === id);
      if (place) router.push(`/places/${place.slug}`);
    },
    [result, router],
  );
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">
            <MapPin size={15} /> OPEN24
          </span>
          <h1>{t.explore}</h1>
          <p>{t.available}</p>
        </div>
        <div className="explore-layout">
          <div>
            <div className="panel search-panel">
              <div className="field">
                <label htmlFor="search-query">{t.search}</label>
                <input
                  id="search-query"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t.searchPlaceholder}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="city">{t.manual}</label>
                  <Select
                    id="city"
                    value={city}
                    onChange={(e) => chooseCity(e.target.value)}
                  >
                    <option value="custom">Selected location</option>
                    {cities.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.key}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="field">
                  <label htmlFor="category">{t.all}</label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">{t.all}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.key}>
                        {locale === "uz"
                          ? c.nameUz
                          : locale === "ru"
                            ? c.nameRu
                            : c.nameEn}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="manual-address">
                  Search an address in Uzbekistan
                </label>
                <div className="field-row field-row-action">
                  <input
                    id="manual-address"
                    value={addressQuery}
                    maxLength={120}
                    onChange={(event) => setAddressQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") searchAddress();
                    }}
                    placeholder="Street, landmark, or district"
                  />
                  <button
                    type="button"
                    className="button button-outline button-small"
                    disabled={addressLoading}
                    onClick={searchAddress}
                  >
                    {addressLoading ? "Searching…" : "Find address"}
                  </button>
                </div>
                {addressMatches.length > 0 && (
                  <div className="result-list" aria-label="Address matches">
                    {addressMatches.map((match, index) => (
                      <button
                        type="button"
                        className="button-plain"
                        key={`${match.label}-${index}`}
                        onClick={() => {
                          addressRequest.current?.abort();
                          setSelectedAddress(match.label);
                          setCenter(match.point);
                          setCity("custom");
                          setPage(1);
                          setAddressMatches([]);
                          setLocationNote("");
                        }}
                      >
                        {match.label}
                      </button>
                    ))}
                    <small>Address data © OpenStreetMap contributors</small>
                  </div>
                )}
              </div>
              <RadiusControl
                value={radius}
                onChange={(value) => {
                  setRadius(value);
                  setPage(1);
                }}
              />
              <div className="check-row">
                <Checkbox
                  label={t.openNow}
                  checked={openNow}
                  onChange={(e) => {
                    setOpenNow(e.target.checked);
                    setPage(1);
                  }}
                />
                <Checkbox
                  label={t.alwaysOpen}
                  checked={alwaysOpen}
                  onChange={(e) => {
                    setAlwaysOpen(e.target.checked);
                    setPage(1);
                  }}
                />
              </div>
              <div className="search-actions">
                <button
                  className="button button-small"
                  type="button"
                  onClick={() => setRevision((n) => n + 1)}
                >
                  <Search size={15} />
                  {t.search}
                </button>
                <button
                  className="button button-outline button-small"
                  type="button"
                  onClick={useLocation}
                >
                  <LocateFixed size={15} />
                  {t.useLocation}
                </button>
              </div>
              <small
                style={{
                  display: "block",
                  color: "var(--muted)",
                  marginTop: 10,
                }}
              >
                {t.locationPrivacy}
              </small>
              {locationNote && (
                <p className="notice" role="status">
                  {locationNote}
                </p>
              )}
              <p className="selected-location" role="status">
                <MapPin size={15} aria-hidden="true" />
                <span>
                  <strong>{t.searchCentre}</strong>
                  <br />
                  {selectedAddress || (city !== "custom" ? city : "")}
                  {selectedAddress || city !== "custom" ? " · " : ""}
                  {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                </span>
              </p>
            </div>
            <div className="result-summary">
              <strong>
                {t.results} · {result?.total ?? 0}
              </strong>
              <span className="eyebrow" style={{ letterSpacing: 0 }}>
                <SlidersHorizontal size={14} /> {t.distance}
              </span>
            </div>
            {loading && (
              <p className="notice" role="status">
                {t.loading}
              </p>
            )}
            {error && (
              <p className="notice error-notice" role="alert">
                {error}
              </p>
            )}
            {!loading && !error && result?.items.length === 0 && (
              <div className="empty">
                {openNow ? t.noConfirmed : t.noResults}
                {radius < 50 && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      className="button-plain"
                      onClick={() => setRadius(Math.min(50, radius * 2))}
                    >
                      {t.radius}: {Math.min(50, radius * 2)} km{" "}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
            {!loading && !error && result && result.items.length > 0 && (
              <div className="result-list">
                {result.items.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </div>
            )}
            {alternatives.length > 0 && (
              <>
                <h2 style={{ fontSize: 19, marginTop: 25 }}>
                  Nearby alternatives
                </h2>
                <div className="result-list">
                  {alternatives.slice(0, 5).map((p) => (
                    <PlaceCard key={p.id} place={p} />
                  ))}
                </div>
              </>
            )}
            {result && result.total > result.limit && (
              <div className="pager">
                <button
                  className="button button-outline button-small"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="button button-outline button-small"
                  disabled={page * result.limit >= result.total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
            {result?.truncated && (
              <p className="notice">
                Showing the closest 1,000 matches. Narrow your search for
                complete results.
              </p>
            )}
          </div>
          <div className="panel explore-map">
            <MapView
              center={center}
              centerLabel={
                selectedAddress || (city !== "custom" ? city : t.searchCentre)
              }
              places={result?.items || []}
              onSelect={selectMarker}
              onChooseLocation={(point) => {
                clearAddress();
                setCenter(point);
                setCity("custom");
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
