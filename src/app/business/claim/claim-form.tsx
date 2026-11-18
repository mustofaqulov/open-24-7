"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ClaimForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/v1/businesses/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, evidence }),
    });
    const d = await r.json();
    if (r.ok) {
      router.push("/business/dashboard");
      router.refresh();
    } else setError(d.error?.message || "Request failed");
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Claim a business</h1>
          <p>
            Ownership is reviewed manually. An address alone cannot establish
            ownership.
          </p>
        </div>
        <form
          className="panel content-card"
          style={{ maxWidth: 640 }}
          onSubmit={submit}
        >
          <div className="field">
            <label htmlFor="claim-evidence">
              How can we verify you represent this business?
            </label>
            <textarea
              id="claim-evidence"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              minLength={20}
              maxLength={1000}
              required
              rows={6}
              placeholder="Describe your role and a contact method on the business’s official website or public phone number."
            />
          </div>
          {error && <p className="notice error-notice">{error}</p>}
          <button className="button">Submit claim</button>
        </form>
      </div>
    </div>
  );
}
