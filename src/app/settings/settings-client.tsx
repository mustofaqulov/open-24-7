"use client";
import { Select } from "@/components/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function SettingsClient({
  name,
  locale,
}: {
  name: string;
  locale: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name);
  const [language, setLanguage] = useState(locale);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/v1/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, locale: language }),
    });
    setMessage(r.ok ? "Settings saved" : "Could not save settings");
    setBusy(false);
  }
  async function remove() {
    if (!window.confirm("Permanently delete your account and favorites?"))
      return;
    const r = await fetch("/api/v1/account", { method: "DELETE" });
    if (r.ok) {
      router.push("/");
      router.refresh();
    } else setMessage("Could not delete account");
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Account settings</h1>
          <p>Your precise location is not stored in your account.</p>
        </div>
        <div className="panel content-card" style={{ maxWidth: 600 }}>
          <form onSubmit={save}>
            <div className="field">
              <label htmlFor="settings-name">Display name</label>
              <input
                id="settings-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="field">
              <label htmlFor="settings-locale">Preferred language</label>
              <Select
                id="settings-locale"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="uz">Uzbek</option>
                <option value="en">English</option>
                <option value="ru">Russian</option>
              </Select>
            </div>
            <button className="button button-small" disabled={busy}>
              Save settings
            </button>
          </form>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <h2>Privacy</h2>
          <p>
            Search coordinates are used for the current request and are not
            saved to your account. If enabled, Google Maps receives the map
            centre after you select a location; Google Routes receives
            coordinates when you request a route.
          </p>
          <button
            className="button button-outline button-small"
            onClick={remove}
          >
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}
