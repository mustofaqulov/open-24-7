"use client";
import { useState } from "react";
type Business = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  phone: string;
  website: string;
};
export function ProfileEditor({ business }: { business: Business }) {
  const [message, setMessage] = useState("");
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);
    const response = await fetch(`/api/v1/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const result = await response.json();
      setMessage(
        result.verification === "PENDING"
          ? "Submitted for review. The listing is hidden until approved."
          : "Business profile saved",
      );
    } else setMessage("Could not save profile");
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Manage {business.name}</h1>
          <p>Changes to contact details are recorded in the audit log.</p>
        </div>
        <form
          className="panel content-card"
          style={{ maxWidth: 690 }}
          onSubmit={save}
        >
          {(["name", "address", "city", "phone", "website"] as const).map(
            (key) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{key}</label>
                <input
                  id={key}
                  name={key}
                  defaultValue={business[key]}
                  required={
                    key === "name" || key === "address" || key === "city"
                  }
                  type={key === "website" ? "url" : "text"}
                />
              </div>
            ),
          )}
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={business.description}
              rows={5}
            />
          </div>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <button className="button">Save profile</button>
        </form>
      </div>
    </div>
  );
}
