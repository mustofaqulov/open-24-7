"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Queue = {
  businesses: { id: string; name: string; address: string; city: string }[];
  claims: {
    id: string;
    evidence: string | null;
    business: { name: string; address: string };
    user: { displayName: string; email: string };
  }[];
  reports: {
    id: string;
    kind: string;
    details: string;
    business: { name: string };
  }[];
};
type Overview = {
  pendingBusinesses: number;
  pendingClaims: number;
  pendingReports: number;
  totalBusinesses: number;
  mapsConfigured: boolean;
  routesConfigured: boolean;
};
export function AdminDashboard({ role }: { role: string }) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("");
  async function load() {
    const [q, o] = await Promise.all([
      fetch("/api/v1/admin/queue").then((r) => r.json()),
      fetch("/api/v1/admin/overview").then((r) => r.json()),
    ]);
    setQueue(q);
    setOverview(o);
  }
  useEffect(() => {
    load().catch(() => setMessage("Admin data unavailable"));
  }, []);
  async function review(
    kind: "business" | "claim" | "report",
    id: string,
    decision: "approve" | "reject",
  ) {
    let note: string | undefined;
    if ((kind === "claim" || kind === "business") && decision === "approve") {
      const answer = window.prompt(
        kind === "claim"
          ? "Record how ownership was independently verified. The account email is not verified."
          : "Record how the business existence, location and details were independently verified.",
      );
      if (answer === null) return;
      note = answer.trim();
      if (note.length < 20) {
        setMessage("Add at least 20 characters of verification evidence.");
        return;
      }
    }
    const r = await fetch("/api/v1/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, decision, note }),
    });
    const result = await r.json();
    setMessage(
      r.ok ? "Review saved" : result.error?.message || "Review failed",
    );
    if (r.ok) await load();
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">OPERATIONS</span>
          <h1>Admin dashboard</h1>
          <p>
            Review listings, claims, and reports before changing public data.
          </p>
        </div>
        <div className="dash-grid">
          <div className="panel stat">
            <strong>{overview?.pendingBusinesses ?? "—"}</strong>
            <span>Pending businesses</span>
          </div>
          <div className="panel stat">
            <strong>{overview?.pendingClaims ?? "—"}</strong>
            <span>Ownership claims</span>
          </div>
          <div className="panel stat">
            <strong>{overview?.pendingReports ?? "—"}</strong>
            <span>Reports</span>
          </div>
          <div className="panel stat">
            <strong>{overview?.totalBusinesses ?? "—"}</strong>
            <span>Total listings</span>
          </div>
        </div>
        <div className="detail-actions">
          <Link
            className="button button-outline button-small"
            href="/admin/businesses"
          >
            Businesses
          </Link>
          {role === "ADMIN" && (
            <>
              <Link
                className="button button-outline button-small"
                href="/admin/categories"
              >
                Categories
              </Link>
              <Link
                className="button button-outline button-small"
                href="/admin/users"
              >
                Users and roles
              </Link>
              <Link
                className="button button-outline button-small"
                href="/admin/audit"
              >
                Audit logs
              </Link>
            </>
          )}
          <Link
            className="button button-outline button-small"
            href="/admin/health"
          >
            System health
          </Link>
          <Link
            className="button button-outline button-small"
            href="/admin/messages"
          >
            Contact messages
          </Link>
        </div>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        {role === "ADMIN" && (
          <>
            <div className="panel queue">
              <h2>Business verification queue</h2>
              {queue?.businesses.length === 0 && <p>No pending businesses.</p>}
              {queue?.businesses.map((b) => (
                <div className="queue-item" key={b.id}>
                  <div>
                    <strong>{b.name}</strong>
                    <small>
                      {b.address}, {b.city}
                    </small>
                  </div>
                  {role === "ADMIN" && (
                    <div className="queue-actions">
                      <button
                        className="button button-small"
                        onClick={() => review("business", b.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="button button-outline button-small"
                        onClick={() => review("business", b.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="panel queue">
              <h2>Ownership claims</h2>
              <p className="notice">
                Account email addresses are unverified. Confirm ownership
                through the business&apos;s official phone or website before
                approval.
              </p>
              {queue?.claims.length === 0 && <p>No pending claims.</p>}
              {queue?.claims.map((c) => (
                <div className="queue-item" key={c.id}>
                  <div>
                    <strong>{c.business.name}</strong>
                    <small>
                      {c.user.displayName} · {c.user.email}
                    </small>
                    <small>{c.evidence}</small>
                  </div>
                  {role === "ADMIN" && (
                    <div className="queue-actions">
                      <button
                        className="button button-small"
                        onClick={() => review("claim", c.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="button button-outline button-small"
                        onClick={() => review("claim", c.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="panel queue">
          <h2>User reports</h2>
          {queue?.reports.length === 0 && <p>No pending reports.</p>}
          {queue?.reports.map((r) => (
            <div className="queue-item" key={r.id}>
              <div>
                <strong>
                  {r.business.name} · {r.kind}
                </strong>
                <small>{r.details}</small>
              </div>
              <div className="queue-actions">
                <button
                  className="button button-small"
                  onClick={() => review("report", r.id, "approve")}
                >
                  Resolve
                </button>
                <button
                  className="button button-outline button-small"
                  onClick={() => review("report", r.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
