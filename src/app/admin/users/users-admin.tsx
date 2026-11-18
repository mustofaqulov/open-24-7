"use client";
import { Select } from "@/components/select";
import { useEffect, useState } from "react";
type User = { id: string; email: string; displayName: string; role: string };
export function UsersAdmin() {
  const [items, setItems] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  async function load() {
    const d = await fetch("/api/v1/admin/users").then((r) => r.json());
    setItems(d.items || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function change(id: string, role: string) {
    const r = await fetch("/api/v1/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    setMessage(r.ok ? "Role updated" : "Role update failed");
    if (r.ok) load();
  }
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Users and roles</h1>
          <p>Only administrators can change roles.</p>
        </div>
        {message && <p className="notice">{message}</p>}
        <div className="panel queue">
          {items.map((u) => (
            <div className="queue-item" key={u.id}>
              <div>
                <strong>{u.displayName}</strong>
                <small>{u.email}</small>
              </div>
              <Select
                aria-label={`Role for ${u.displayName}`}
                value={u.role}
                onChange={(e) => change(u.id, e.target.value)}
              >
                <option value="USER">User</option>
                <option value="OWNER">Owner</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Administrator</option>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
