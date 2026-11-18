const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const before = (days) => new Date(Date.now() - days * 86400000);

async function main() {
  const now = new Date();
  const [sessions, contacts, reports, audit, limits] = await Promise.all([
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.contactMessage.deleteMany({ where: { createdAt: { lt: before(90) } } }),
    db.report.deleteMany({ where: { state: { in: ["RESOLVED", "REJECTED"] }, createdAt: { lt: before(365) } } }),
    db.auditLog.deleteMany({ where: { createdAt: { lt: before(365) } } }),
    db.$executeRaw`DELETE FROM rate_limits WHERE bucket < ${before(2)}`,
  ]);
  console.log(JSON.stringify({ event: "maintenance_complete", sessions: sessions.count, contacts: contacts.count, reports: reports.count, audit: audit.count, limits }));
}
main().catch((error) => {
  console.error(JSON.stringify({ event: "maintenance_failed", kind: error.name }));
  process.exitCode = 1;
}).finally(() => db.$disconnect());
