"use client";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/locale";
import { decodePolyline } from "@/lib/polyline";
import { accentColor, DEFAULT_ZOOM, googleBrowserKey } from "@/lib/map-config";
import { MapFallback } from "./map-fallback";
import type { MapPoint, MapViewProps } from "./types";

type GoogleMarker = {
  setMap: (value: unknown) => void;
  addListener: (name: string, handler: () => void) => void;
};
type GoogleMaps = {
  Map: new (element: HTMLElement, options: object) => unknown;
  Marker: new (options: object) => GoogleMarker;
  Polyline: new (options: object) => { setMap: (value: unknown) => void };
};

let scriptPromise: Promise<void> | null = null;
function loadGoogle(key: string) {
  if ((window as unknown as { google?: unknown }).google)
    return Promise.resolve();
  if (!scriptPromise)
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    });
  return scriptPromise;
}
function googleMaps(): GoogleMaps {
  return (window as unknown as { google: { maps: GoogleMaps } }).google.maps;
}

export function GoogleMap({
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
  const mapRef = useRef<unknown>(null);
  const markers = useRef<GoogleMarker[]>([]);
  const line = useRef<{ setMap: (value: unknown) => void } | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const key = googleBrowserKey();

  useEffect(() => {
    if (!container.current || !key) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [key]);

  useEffect(() => {
    if (!key || !container.current || !visible) return;
    let live = true;
    loadGoogle(key)
      .then(() => {
        if (!live || !container.current) return;
        const maps = googleMaps();
        const map = new maps.Map(container.current, {
          center,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        setReady(true);
        const clickable = map as {
          addListener: (
            name: string,
            handler: (event: {
              latLng: { lat: () => number; lng: () => number };
            }) => void,
          ) => void;
        };
        clickable.addListener("click", (event) =>
          onChooseLocation?.({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }),
        );
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      mapRef.current = null;
    };
  }, [key, visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const maps = googleMaps();
    const view = map as {
      setCenter: (point: MapPoint) => void;
      fitBounds: (bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
      }) => void;
    };
    view.setCenter(center);
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    markers.current.push(
      new maps.Marker({
        map,
        position: center,
        title: centerLabel || t.searchCentre,
        label: "S",
      }),
    );
    for (const place of places) {
      const marker = new maps.Marker({
        map,
        position: { lat: place.latitude, lng: place.longitude },
        title: place.name,
      });
      marker.addListener("click", () => onSelect?.(place.id));
      markers.current.push(marker);
    }
    line.current?.setMap(null);
    const path = routePolyline ? decodePolyline(routePolyline) : null;
    line.current = path
      ? new maps.Polyline({
          map,
          path,
          strokeColor: accentColor(),
          strokeWeight: 5,
        })
      : null;
    if (path?.length) {
      const latitudes = path.map((point) => point.lat);
      const longitudes = path.map((point) => point.lng);
      view.fitBounds({
        north: Math.max(...latitudes),
        south: Math.min(...latitudes),
        east: Math.max(...longitudes),
        west: Math.min(...longitudes),
      });
    }
  }, [
    center,
    centerLabel,
    places,
    selectedId,
    routePolyline,
    onSelect,
    ready,
    t.searchCentre,
  ]);

  if (!key || failed)
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
