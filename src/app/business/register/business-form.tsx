"use client";
import { Select } from "@/components/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Category = { id: string; key: string; nameEn: string };
export function BusinessForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name")),
      categoryId: String(form.get("categoryId")),
      address: String(form.get("address")),
      city: String(form.get("city")),
      latitude: Number(form.get("latitude")),
      longitude: Number(form.get("longitude")),
      timezone: String(form.get("timezone")),
      phone: String(form.get("phone") || ""),
      website: String(form.get("website") || "") || undefined,
      description: String(form.get("description") || ""),
    };
    try {
      const r = await fetch("/api/v1/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Submission failed");
      router.push("/business/dashboard");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Register a business</h1>
          <p>
            Provide real, reviewable information. Your listing stays private
            until approved.
          </p>
        </div>
        <form
          className="panel content-card"
          style={{ maxWidth: 720 }}
          onSubmit={submit}
        >
          <div className="field">
            <label htmlFor="business-name">Business name</label>
            <input id="business-name" name="name" required minLength={2} />
          </div>
          <div className="field">
            <label htmlFor="business-category">Category</label>
            <Select id="business-category" name="categoryId" required>
              <option value="">Choose category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </Select>
          </div>
          <div className="field">
            <label htmlFor="business-address">Street address</label>
            <input
              id="business-address"
              name="address"
              required
              minLength={5}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="business-city">City</label>
              <input
                id="business-city"
                name="city"
                required
                defaultValue="Qarshi"
              />
            </div>
            <div className="field">
              <label htmlFor="business-timezone">Timezone</label>
              <input
                id="business-timezone"
                name="timezone"
                required
                defaultValue="Asia/Tashkent"
              />
            </div>
          </div>
          <p>
            Enter the verified location coordinates from your business location.
            Moderators review them before publication.
          </p>
          <div className="field-row">
            <div className="field">
              <label htmlFor="business-lat">Latitude</label>
              <input
                id="business-lat"
                name="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="business-lng">Longitude</label>
              <input
                id="business-lng"
                name="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                required
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="business-phone">Phone</label>
              <input id="business-phone" name="phone" type="tel" />
            </div>
            <div className="field">
              <label htmlFor="business-website">Website</label>
              <input id="business-website" name="website" type="url" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="business-description">Description</label>
            <textarea id="business-description" name="description" rows={4} />
          </div>
          {error && (
            <p className="notice error-notice" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            Submit for review
          </button>
        </form>
      </div>
    </div>
  );
}
