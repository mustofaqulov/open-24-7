import { deleteSession } from "@/lib/auth";
import { error, handleError, json, sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    await deleteSession();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
