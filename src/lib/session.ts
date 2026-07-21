import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_COOKIE,
} from "@/lib/constants";

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("Missing SESSION_SECRET");
  return new TextEncoder().encode(value);
};

export type ReferrerSession = {
  type: "referrer";
  referrerId: string;
  email: string;
  fullName: string;
};

export type AdminSession = {
  type: "admin";
  email: string;
};

async function signToken(payload: ReferrerSession | AdminSession) {
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export async function createReferrerSession(
  session: Omit<ReferrerSession, "type">
) {
  const token = await signToken({ ...session, type: "referrer" });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function createAdminSession(email: string) {
  const token = await signToken({ type: "admin", email });
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getReferrerSession(): Promise<ReferrerSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken<ReferrerSession>(token);
  if (!session || session.type !== "referrer") return null;
  return session;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken<AdminSession>(token);
  if (!session || session.type !== "admin") return null;
  return session;
}

export async function clearReferrerSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}
