import { NextResponse } from "next/server";
import { ZodError } from "zod";
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function error(message: string, status = 400) {
  return json({ error: { message } }, status);
}
export function handleError(e: unknown) {
  if (e instanceof ZodError)
    return json(
      {
        error: {
          message: "Invalid input",
          issues: e.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      },
      400,
    );
  const id = crypto.randomUUID();
  console.error(
    JSON.stringify({
      level: "error",
      event: "request_failed",
      id,
      kind: e instanceof Error ? e.name : "unknown",
    }),
  );
  return json({ error: { message: "Service temporarily unavailable", id } }, 503);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
