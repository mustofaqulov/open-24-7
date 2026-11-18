import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { error, handleError, json, sameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate";
import { registerSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "register", 5, 15)))
      return error("Too many attempts", 429);
    const data = registerSchema.parse(await request.json());
    const email = data.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } }))
      return error("Unable to create account", 400);
    const user = await db.user.create({
      data: {
        email,
        passwordHash: await hash(data.password, 12),
        displayName: data.displayName,
        locale: data.locale,
      },
    });
    await createSession(user.id);
    return json(
      { user: { id: user.id, displayName: user.displayName, role: user.role } },
      201,
    );
  } catch (e) {
    return handleError(e);
  }
}
