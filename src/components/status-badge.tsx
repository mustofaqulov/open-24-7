"use client";
import { useT } from "./locale";
export function StatusBadge({
  status,
  alwaysOpen,
}: {
  status: string;
  alwaysOpen?: boolean;
}) {
  const { t } = useT();
  const cls =
    status === "OPEN"
      ? "open"
      : status === "CLOSED"
        ? "closed"
        : status === "TEMPORARILY_CLOSED"
          ? "temporary"
          : "unknown";
  const label =
    status === "OPEN"
      ? alwaysOpen
        ? "Open 24/7"
        : t.open
      : status === "CLOSED"
        ? t.closed
        : status === "TEMPORARILY_CLOSED"
          ? t.temporary
          : t.hoursUnknown;
  return (
    <span className={`badge ${cls}`} role="status">
      <span aria-hidden="true">●</span>
      {label}
    </span>
  );
}
