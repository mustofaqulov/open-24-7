import { createHmac } from "node:crypto";
import { db } from "./db";
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  minutes = 1,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const secret = process.env.RATE_LIMIT_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-dev-only");
  if (!secret || (process.env.NODE_ENV === "production" && secret.length < 32))
    throw new Error("Rate limit secret missing or too short");
  const key = createHmac("sha256", secret).update(`${scope}:${ip}`).digest("hex");
  const bucket = new Date(
    Math.floor(Date.now() / (minutes * 60000)) * minutes * 60000,
  );
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO rate_limits (key,bucket,count) VALUES (${key},${bucket},1) ON CONFLICT (key,bucket) DO UPDATE SET count=rate_limits.count+1 RETURNING count`;
  return rows[0].count <= limit;
}
