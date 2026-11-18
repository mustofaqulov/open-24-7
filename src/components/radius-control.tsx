"use client";
import { Radar } from "lucide-react";
import { useT } from "./locale";

export function RadiusControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useT();
  return (
    <div className="radius-control">
      <div className="radius-heading">
        <label htmlFor="radius">
          <Radar size={17} aria-hidden="true" />
          {t.radius}
        </label>
        <output htmlFor="radius">
          {value}
          <span>km</span>
        </output>
      </div>
      <input
        id="radius"
        type="range"
        min={1}
        max={50}
        value={value}
        aria-valuetext={`${value} km`}
        className="radius-slider"
        style={{ backgroundSize: `${((value - 1) / 49) * 100}% 4px, 100% 4px` }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="radius-presets" role="group" aria-label={t.radius}>
        {[1, 5, 10, 25, 50].map((distance) => (
          <button
            key={distance}
            type="button"
            aria-pressed={value === distance}
            onClick={() => onChange(distance)}
          >
            {distance} km
          </button>
        ))}
      </div>
    </div>
  );
}
