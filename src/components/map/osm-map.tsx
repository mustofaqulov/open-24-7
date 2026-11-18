"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { useT } from "@/components/locale";
import { decodePolyline } from "@/lib/polyline";
import {
  accentColor,
  DEFAULT_ZOOM,
  MAX_TILE_ZOOM,
  MIN_TILE_ZOOM,
  tileSource,
} from "@/lib/map-config";
import { MapFallback } from "./map-fallback";
import type { MapPlace, MapPoint, MapViewProps } from "./types";

type LeafletModule = typeof Leaflet;
type Status = "loading" | "ready" | "failed";
/** Street level zoom applied when the visitor picks a new centre. */
const FOCUS_ZOOM = 15;

function pinIcon(L: LeafletModule, variant: "centre" | "place" | "selected") {
  return L.divIcon({
    className: "map-pin-wrap",
    html: `<span class="map-pin map-pin-${variant}"></span>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    tooltipAnchor: [0, -24],
  });
}

function tooltip(text: string) {
  const node = document.createElement("span");
  node.textContent = text;
  return node;
}

function placeSignature(places: MapPlace[]) {
  return places.map((place) => place.id).join("|");
}

export function OsmMap({
  center,
  centerLabel,
  places = [],
  selectedId,
  routePolyline,
  onSelect,
  onChooseLocation,
}: MapViewProps) {
  const { t } = useT();
  const container = useRef<HTMLDivElement>(null);
  const leaflet = useRef<LeafletModule | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Leaflet.Marker[]>([]);
  const route = useRef<Leaflet.Polyline | null>(null);
  const fitted = useRef("");
  const centred = useRef("");
  const choose = useRef(onChooseLocation);
  const select = useRef(onSelect);
  const [status, setStatus] = useState<Status>("loading");
  const [visible, setVisible] = useState(false);

  choose.current = onChooseLocation;
  select.current = onSelect;

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !container.current || map.current) return;
    let live = true;
    import("leaflet")
      .then((module) => {
        const L = (module.default ?? module) as LeafletModule;
        if (!live || !container.current) return;
        const source = tileSource();
        const instance = L.map(container.current, {
          center: [center.lat, center.lng],
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          attributionControl: false,
        });
        L.tileLayer(source.url, {
          attribution: source.attribution,
          maxZoom: MAX_TILE_ZOOM,
          minZoom: MIN_TILE_ZOOM,
        }).addTo(instance);
        instance.on("click", (event: Leaflet.LeafletMouseEvent) =>
          choose.current?.({ lat: event.latlng.lat, lng: event.latlng.lng }),
        );
        leaflet.current = L;
        map.current = instance;
        // The first view is the city overview, not a focused centre.
        centred.current = `${center.lat},${center.lng}`;
        setStatus("ready");
      })
      .catch(() => {
        if (live) setStatus("failed");
      });
    return () => {
      live = false;
    };
  }, [visible]);

  useEffect(
    () => () => {
      map.current?.remove();
      map.current = null;
      markers.current = [];
      route.current = null;
    },
    [],
  );

  useEffect(() => {
    const L = leaflet.current;
    const instance = map.current;
    if (!L || !instance || status !== "ready") return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    const centreMarker = L.marker([center.lat, center.lng], {
      icon: pinIcon(L, "centre"),
      keyboard: false,
      interactive: false,
      zIndexOffset: 400,
    })
      .addTo(instance)
      .bindTooltip(tooltip(centerLabel || t.searchCentre));
    markers.current.push(centreMarker);

    for (const place of places) {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: pinIcon(L, place.id === selectedId ? "selected" : "place"),
        title: place.name,
        alt: place.name,
      })
        .addTo(instance)
        .bindTooltip(tooltip(place.name));
      marker.on("click", (event: Leaflet.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event);
        select.current?.(place.id);
      });
      markers.current.push(marker);
    }

    route.current?.remove();
    route.current = null;
    const path = routePolyline ? decodePolyline(routePolyline) : [];
    if (path.length > 1) {
      route.current = L.polyline(
        path.map((point): Leaflet.LatLngTuple => [point.lat, point.lng]),
        { color: accentColor(), weight: 5, opacity: 0.9 },
      ).addTo(instance);
      instance.fitBounds(route.current.getBounds(), { padding: [40, 40] });
      fitted.current = routePolyline ?? "";
      return;
    }

    const signature = placeSignature(places);
    const centreKey = `${center.lat},${center.lng}`;
    // A new centre comes from a city, an address match, the device position
    // or a map click, so it is shown before any result fitting.
    if (centred.current !== centreKey) {
      centred.current = centreKey;
      fitted.current = signature;
      instance.setView(
        [center.lat, center.lng],
        Math.max(instance.getZoom(), FOCUS_ZOOM),
      );
      return;
    }
    if (places.length > 0 && fitted.current !== signature) {
      const bounds = L.latLngBounds(
        places.map((place): Leaflet.LatLngTuple => [
          place.latitude,
          place.longitude,
        ]),
      ).extend([center.lat, center.lng] as Leaflet.LatLngTuple);
      instance.fitBounds(bounds, { padding: [40, 40], maxZoom: MAX_TILE_ZOOM });
      fitted.current = signature;
    }
  }, [
    center,
    centerLabel,
    places,
    selectedId,
    routePolyline,
    status,
    t.searchCentre,
  ]);

  if (status === "failed")
    return <MapFallback showManualHint={Boolean(onChooseLocation)} />;
  return (
    <div
      ref={container}
      className="map-canvas"
      role="application"
      aria-label={t.mapLabel}
    />
  );
}

export type { MapPlace, MapPoint };
