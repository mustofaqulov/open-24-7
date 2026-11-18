"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function RecentSearches() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    try {
      setItems(
        JSON.parse(sessionStorage.getItem("open24-recent-terms") || "[]"),
      );
    } catch {}
  }, []);
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Recent searches</h1>
          <p>
            Search terms from this browser tab. Precise locations are never
            saved here.
          </p>
        </div>
        <div className="panel content-card">
          <div className="result-list">
            {items.map((item) => (
              <Link
                className="place-card"
                href={`/explore?q=${encodeURIComponent(item)}`}
                key={item}
              >
                {item}
              </Link>
            ))}
            {items.length === 0 && (
              <div className="empty">No recent search terms.</div>
            )}
          </div>
          <button
            style={{ marginTop: 18 }}
            className="button button-outline button-small"
            onClick={() => {
              sessionStorage.removeItem("open24-recent-terms");
              setItems([]);
            }}
          >
            Clear searches
          </button>
        </div>
      </div>
    </div>
  );
}
