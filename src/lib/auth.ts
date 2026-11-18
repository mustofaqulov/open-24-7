import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
const NAME = "open24_session";
const days = 14;
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function sessionUser() {
  const token = (await cookies()).get(NAME)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: digest(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          locale: true,
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.session.create({
    data: {
      userId,
      tokenHash: digest(token),
      expiresAt: new Date(Date.now() + days * 86400000),
    },
  });
  (await cookies()).set(NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: days * 86400,
  });
}
export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(NAME)?.value;
  if (token)
    await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(NAME);
}
export function canModerate(role: string) {
  return role === "ADMIN" || role === "MODERATOR";
}
export async function canEditBusiness(
  userId: string,
  role: string,
  businessId: string,
) {
  if (role === "ADMIN") return true;
  return !!(await db.ownership.findFirst({
    where: { userId, businessId, status: "VERIFIED" },
  }));
}
