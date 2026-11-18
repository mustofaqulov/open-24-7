"use client";
import { useEffect, useState } from "react";
type Category = {
  id: string;
  key: string;
  nameUz: string;
  nameEn: string;
  nameRu: string;
};
export function CategoryAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  async function load() {
    const r = await fetch("/api/v1/categories");
    const d = await r.json();
    setItems(d.items || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);
    const r = await fetch("/api/v1/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMessage(r.ok ? "Category created" : "Could not create category");
    if (r.ok) {
      e.currentTarget.reset();
      load();
    }
  }
  async function update(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const response = await fetch("/api/v1/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    setMessage(response.ok ? "Category updated" : "Could not update category");
    if (response.ok) load();
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Category management</h1>
          <p>Translated category names are stored in the database.</p>
        </div>
        <form
          className="panel content-card"
          style={{ maxWidth: 650 }}
          onSubmit={submit}
        >
          <div className="field">
            <label htmlFor="key">Stable key</label>
            <input id="key" name="key" required pattern="[a-z][a-z0-9_]+" />
          </div>
          {(["nameUz", "nameEn", "nameRu"] as const).map((key) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{key}</label>
              <input id={key} name={key} required />
            </div>
          ))}
          <button className="button">Add category</button>
        </form>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        <div className="result-list">
          {items.map((c) => (
            <div className="place-card" key={c.id}>
              <strong>{c.key}</strong>
              <form onSubmit={(event) => update(event, c.id)}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {(["nameUz", "nameEn", "nameRu"] as const).map((key) => (
                    <div className="field" key={key}>
                      <label htmlFor={`${c.id}-${key}`}>{key}</label>
                      <input
                        id={`${c.id}-${key}`}
                        name={key}
                        defaultValue={c[key]}
                        required
                      />
                    </div>
                  ))}
                </div>
                <button className="button button-outline button-small">
                  Update translations
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
