import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
const testUrl =
  process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : undefined;
export const db =
  globalDb.prisma ??
  new PrismaClient({
    log: ["error"],
    ...(testUrl ? { datasources: { db: { url: testUrl } } } : {}),
  });
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
