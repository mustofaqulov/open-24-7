"use client";
import { googleBrowserKey } from "@/lib/map-config";
import { GoogleMap } from "./map/google-map";
import { OsmMap } from "./map/osm-map";
import type { MapViewProps } from "./map/types";

export type { MapPlace, MapPoint, MapViewProps } from "./map/types";

/**
 * Interactive map. The OpenStreetMap base map needs no key and is used unless
 * the operator approved and configured the Google Maps integration.
 */
export function MapView(props: MapViewProps) {
  if (googleBrowserKey()) return <GoogleMap {...props} />;
  return <OsmMap {...props} />;
}
