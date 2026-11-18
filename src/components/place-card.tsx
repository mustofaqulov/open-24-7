"use client";
import Link from "next/link";
import { MapPin, Clock3, Navigation } from "lucide-react";
import { useT } from "./locale";
import { StatusBadge } from "./status-badge";
export type PlaceSummary = {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  category: { key: string; nameUz: string; nameEn: string; nameRu: string };
  status: string;
  alwaysOpen: boolean;
  todaysHours: string;
  distanceMeters: number;
  hoursVerifiedAt: string | null;
  hoursSource: string;
  sources: string[];
};
export function PlaceCard({ place }: { place: PlaceSummary }) {
  const { t, locale } = useT();
  const category =
    locale === "uz"
      ? place.category.nameUz
      : locale === "ru"
        ? place.category.nameRu
        : place.category.nameEn;
  return (
    <div className="place-card">
      <Link href={`/places/${place.slug}`}>
        <div className="place-top">
          <div>
            <small className="eyebrow" style={{ letterSpacing: ".5px" }}>
              {category}
            </small>
            <h3>{place.name}</h3>
          </div>
          <StatusBadge status={place.status} alwaysOpen={place.alwaysOpen} />
        </div>
        <p>
          {place.address}, {place.city}
        </p>
        <div className="place-meta">
          <span>
            <MapPin size={14} />
            {(place.distanceMeters / 1000).toFixed(1)} km · {t.distance}
          </span>
          <span>
            <Clock3 size={14} />
            {place.todaysHours}
          </span>
          <span>
            <Navigation size={14} />
            {t.directions}
          </span>
        </div>
      </Link>
      {place.sources.includes("osm") && (
        <small
          style={{ display: "block", marginTop: 9, color: "var(--muted)" }}
        >
          {t.data}:{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            {t.osmContributors} (ODbL)
          </a>
        </small>
      )}
    </div>
  );
}
