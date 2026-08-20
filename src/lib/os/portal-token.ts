import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function createPortalToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPortalToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenHint(token: string) {
  return token.slice(-6);
}

export function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
