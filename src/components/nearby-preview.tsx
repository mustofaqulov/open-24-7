"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Checkbox } from "./checkbox";
import { MapView } from "./map-view";
import { PlaceCard, PlaceSummary } from "./place-card";
import { useT } from "./locale";
const center = { lat: 38.8598, lng: 65.7898 };
export function NearbyPreview() {
  const { t } = useT();
  const [openNow, setOpenNow] = useState(false);
  const [alwaysOpen, setAlwaysOpen] = useState(false);
  const [items, setItems] = useState<PlaceSummary[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    fetch("/api/v1/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...center,
        radius: 10,
        limit: 3,
        page: 1,
        openNow: String(openNow),
        alwaysOpen: String(alwaysOpen),
      }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error();
        setItems(d.items || []);
        setState("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setState("unavailable");
      });
    return () => controller.abort();
  }, [openNow, alwaysOpen]);
  return (
    <section className="section nearby-section" id="nearby">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t.qarshi}</span>
            <h2>{t.nearbyPlaces}</h2>
            <p>{t.available}</p>
          </div>
          <Link className="button-plain" href="/explore">
            {t.viewAll} →
          </Link>
        </div>
        <div className="check-row">
          <Checkbox
            label={t.openNow}
            checked={openNow}
            onChange={(e) => setOpenNow(e.target.checked)}
          />
          <Checkbox
            label={t.alwaysOpen}
            checked={alwaysOpen}
            onChange={(e) => setAlwaysOpen(e.target.checked)}
          />
        </div>
        <div className="split-section">
          <div className="result-list">
            {state === "loading" && <div className="empty">{t.loading}</div>}
            {state === "unavailable" && (
              <div className="empty">{t.placesUnavailable}</div>
            )}
            {state === "ready" && items.length === 0 && (
              <div className="empty">
                {openNow ? t.noConfirmed : t.noResults}{" "}
                <Link href="/explore">{t.explore}</Link>.
              </div>
            )}
            {items.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
          <div className="map-preview">
            <MapView center={center} places={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
