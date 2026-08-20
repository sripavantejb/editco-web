import { jwtVerify, type JWTPayload } from "jose";

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value) return null;
  return new TextEncoder().encode(value);
}

/** Edge-safe admin JWT check for middleware (no DB). */
export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const key = sessionSecret();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return (payload as JWTPayload).type === "admin";
  } catch {
    return false;
  }
}
