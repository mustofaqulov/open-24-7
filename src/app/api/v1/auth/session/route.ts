import { sessionUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";
export async function GET() {
  try {
    return json({ user: await sessionUser() });
  } catch (e) {
    return handleError(e);
  }
}
