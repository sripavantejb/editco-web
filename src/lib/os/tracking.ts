import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Lead } from "@/models/os/Lead";
import {
  TRACK_REQUIRE_EMAIL,
  normalizeEmail,
  normalizeTrackingCode,
} from "@/lib/os/tracking-stages";
import "@/models/os/register";

export {
  TRACK_STAGES,
  TRACK_STAGE_LABELS,
  TRACK_STAGE_BLURBS,
  deriveStage,
  stageIndex,
  TRACK_REQUIRE_EMAIL,
  normalizeTrackingCode,
  normalizeEmail,
  type TrackStage,
} from "@/lib/os/tracking-stages";

export const TRACK_COOKIE = "editco_track";

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("Missing SESSION_SECRET");
  return new TextEncoder().encode(value);
};

export type TrackSession = {
  type: "track";
  code: string;
  conversionUuid: string;
  email?: string;
};

/**
 * Resolves a tracking code to its conversion. Codes are the only credential
 * unless TRACK_REQUIRE_EMAIL is on, in which case the client email on the
 * record must match as well.
 */
export async function verifyTrackingClaim(rawCode: string, rawEmail = "") {
  const code = normalizeTrackingCode(rawCode);
  const email = normalizeEmail(rawEmail);
  if (!code) return null;
  if (TRACK_REQUIRE_EMAIL && !email) return null;

  await connectDB();
  const conversion = await Conversion.findOne({
    publicCode: code,
    recordStatus: "active",
  })
    .select("conversionUuid publicCode leadId")
    .lean();
  if (!conversion) return null;

  const [vendor, lead] = await Promise.all([
    Vendor.findOne({ conversionUuid: conversion.conversionUuid })
      .select("email companyName")
      .lean(),
    conversion.leadId
      ? Lead.findById(conversion.leadId).select("email").lean()
      : Promise.resolve(null),
  ]);

  if (TRACK_REQUIRE_EMAIL) {
    const allowed = [vendor?.email, lead?.email]
      .map((e) => normalizeEmail(String(e || "")))
      .filter(Boolean);
    if (!allowed.includes(email)) return null;
  }

  return {
    code: conversion.publicCode,
    conversionUuid: conversion.conversionUuid,
    email,
    companyName: vendor?.companyName || "",
  };
}

export async function createTrackSession(session: Omit<TrackSession, "type">) {
  const token = await new SignJWT({ ...session, type: "track" } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const jar = await cookies();
  jar.set(TRACK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getTrackSession(): Promise<TrackSession | null> {
  const jar = await cookies();
  const token = jar.get(TRACK_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const session = payload as unknown as TrackSession;
    return session?.type === "track" ? session : null;
  } catch {
    return null;
  }
}

export async function clearTrackSession() {
  const jar = await cookies();
  jar.delete(TRACK_COOKIE);
}

/** A session only unlocks the one code it was issued for. */
export async function requireTrackSession(code: string) {
  const session = await getTrackSession();
  if (!session) return null;
  return session.code === normalizeTrackingCode(code) ? session : null;
}
