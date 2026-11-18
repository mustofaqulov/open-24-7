import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
export default async function Page() {
  const user = await sessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <h1>Audit logs</h1>
          <p>Recent sensitive actions.</p>
        </div>
        <div className="panel queue">
          {logs.map((log) => (
            <div className="queue-item" key={log.id}>
              <div>
                <strong>{log.action}</strong>
                <small>
                  {log.resourceType} · {log.resourceId}
                </small>
              </div>
              <small>{log.createdAt.toISOString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
