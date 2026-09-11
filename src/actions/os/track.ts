"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  TRACK_REQUIRE_EMAIL,
  clearTrackSession,
  createTrackSession,
  normalizeTrackingCode,
  verifyTrackingClaim,
} from "@/lib/os/tracking";

export type TrackFormState = { error?: string } | undefined;

/**
 * Per-process throttles. Codes are sequential, so the per-IP bucket is the one
 * that actually stops someone walking ECM2026001, 002, 003...; the per-code
 * bucket only slows a single guessed code. A distributed attack needs a shared
 * store, which this app has no infrastructure for yet.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_CODE = 8;
const MAX_PER_IP = 12;

type Bucket = { count: number; first: number };
const byCode = new Map<string, Bucket>();
const byIp = new Map<string, Bucket>();

function overLimit(store: Map<string, Bucket>, key: string, max: number) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    store.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export async function startTracking(
  _prev: TrackFormState,
  formData: FormData
): Promise<TrackFormState> {
  const rawCode = String(formData.get("code") || "");
  const rawEmail = String(formData.get("email") || "");

  if (!rawCode.trim()) {
    return { error: "Enter your tracking code." };
  }
  if (TRACK_REQUIRE_EMAIL && !rawEmail.trim()) {
    return { error: "Enter the email on your project." };
  }

  const code = normalizeTrackingCode(rawCode);
  const ip = await clientIp();
  const throttled =
    overLimit(byIp, ip, MAX_PER_IP) || overLimit(byCode, code, MAX_PER_CODE);
  if (throttled) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const claim = await verifyTrackingClaim(rawCode, rawEmail);
  // One message for every failure — never reveal whether the code itself exists.
  if (!claim) {
    return {
      error: TRACK_REQUIRE_EMAIL
        ? "We couldn't match that code and email. Check both and try again."
        : "We couldn't find that tracking code. Check it and try again.",
    };
  }

  byCode.delete(code);
  byIp.delete(ip);
  await createTrackSession({
    code: claim.code,
    conversionUuid: claim.conversionUuid,
    email: claim.email || undefined,
  });
  redirect(`/track/${claim.code}`);
}

export async function signOutTracking(formData: FormData) {
  const code = String(formData.get("code") || "");
  await clearTrackSession();
  redirect(code ? `/track?code=${encodeURIComponent(code)}` : "/track");
}
