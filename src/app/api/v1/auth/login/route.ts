import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { loginSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "login", 10, 15)))
      return error("Too many attempts", 429);
    const data = loginSchema.parse(await request.json());
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user || !(await compare(data.password, user.passwordHash)))
      return error("Invalid credentials", 401);
    await createSession(user.id);
    return json({
      user: { id: user.id, displayName: user.displayName, role: user.role },
    });
  } catch (e) {
    return handleError(e);
  }
}
