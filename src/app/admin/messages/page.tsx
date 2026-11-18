import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function Page() {
  const user = await sessionUser();
  if (user?.role !== "ADMIN" && user?.role !== "MODERATOR") redirect("/login");
  const items = await db.contactMessage.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Contact messages</h1>
          <p>Recent messages submitted through the contact form.</p>
        </div>
        <div className="panel queue">
          {items.map((m) => (
            <div className="queue-item" key={m.id}>
              <div>
                <strong>
                  {m.name} · {m.email}
                </strong>
                <small>{m.message}</small>
              </div>
              <small>{m.createdAt.toISOString()}</small>
            </div>
          ))}
          {items.length === 0 && <p>No messages yet.</p>}
        </div>
      </div>
    </div>
  );
}
