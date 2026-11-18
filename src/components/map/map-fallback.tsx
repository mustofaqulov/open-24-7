"use client";
import { MapPinned } from "lucide-react";
import { useT } from "@/components/locale";

export function MapFallback({ showManualHint }: { showManualHint?: boolean }) {
  const { t } = useT();
  return (
    <div className="map-fallback">
      <MapPinned size={38} />
      <p>{t.mapUnavailable}</p>
      {showManualHint && <p>{t.manual}</p>}
    </div>
  );
}
