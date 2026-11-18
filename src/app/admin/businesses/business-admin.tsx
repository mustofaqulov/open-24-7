"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Business = { id: string; name: string; address: string; city: string; verification: string };
export function BusinessAdmin({ canEdit }: { canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Business[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ q: query, page: String(page) });
    fetch(`/api/v1/admin/businesses?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Unavailable");
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((cause) => { if (cause.name !== "AbortError") setError(cause.message); });
    return () => controller.abort();
  }, [query, page]);
  return <div className="page-shell"><div className="container"><div className="page-heading"><h1>Business management</h1><p>Review all listings and correct approved records.</p></div><div className="field"><label htmlFor="admin-business-q">Search business name</label><input id="admin-business-q" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div>{error && <p className="notice error-notice">{error}</p>}<div className="panel queue">{items.map(b => <div className="queue-item" key={b.id}><div><strong>{b.name}</strong><small>{b.address}, {b.city} · {b.verification}</small></div>{canEdit && <div className="queue-actions"><Link className="button button-outline button-small" href={`/business/manage/${b.id}`}>Edit profile</Link><Link className="button button-outline button-small" href={`/admin/businesses/${b.id}/hours`}>Edit hours</Link></div>}</div>)}</div><div className="pager"><button className="button button-outline button-small" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="button button-outline button-small" disabled={page * 30 >= total} onClick={() => setPage(page + 1)}>Next</button></div></div></div>;
}
