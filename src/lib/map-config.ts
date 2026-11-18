/** Base map configuration shared by the interactive map components. */
export const DEFAULT_TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
export const DEFAULT_ZOOM = 13;
export const MAX_TILE_ZOOM = 19;
export const MIN_TILE_ZOOM = 3;

export type TileSource = { url: string; attribution: string };

/**
 * Raster tile source for the default map. Operators can point this at their
 * own or a contracted tile service; the public OpenStreetMap servers are a
 * development default and are rate limited by their usage policy.
 */
export function tileSource(): TileSource {
  const url = process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim();
  const attribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION?.trim();
  if (!url)
    return { url: DEFAULT_TILE_URL, attribution: DEFAULT_TILE_ATTRIBUTION };
  return { url, attribution: attribution || DEFAULT_TILE_ATTRIBUTION };
}

/** Google map key, returned only when the operator approved the integration. */
export function googleBrowserKey(): string | undefined {
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_APPROVED !== "true") return undefined;
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || undefined;
}

const FALLBACK_ACCENT = "#00B4FF";

/** Current theme accent, used for the drawn route line. */
export function accentColor(): string {
  if (typeof window === "undefined") return FALLBACK_ACCENT;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  return value || FALLBACK_ACCENT;
}
