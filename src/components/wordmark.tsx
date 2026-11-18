import { MapPin } from "lucide-react";

export function Wordmark() {
  return (
    <span className="wordmark">
      <MapPin aria-hidden="true" strokeWidth={2.3} />
      <span>
        open24<span className="wordmark-dot">.</span>
      </span>
    </span>
  );
}
