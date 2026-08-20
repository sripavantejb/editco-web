import { connectDB } from "@/lib/db";
import { hashPortalToken } from "@/lib/os/portal-token";
import { PortalAccess } from "@/models/os/PortalAccess";
import { Vendor } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";
import "@/models/os/register";

async function loadPortalContext(access: {
  conversionUuid: string;
}) {
  const vendor = await Vendor.findOne({
    conversionUuid: access.conversionUuid,
    recordStatus: "active",
  }).lean();
  const conversion = await Conversion.findOne({
    conversionUuid: access.conversionUuid,
  }).lean();
  if (!vendor || !conversion) return null;
  return { vendor, conversion };
}

/** Resolve by stable conversion UUID (`/client-portal/{uuid}`). */
export async function resolvePortalByUuid(conversionUuid: string) {
  if (!conversionUuid?.trim()) return null;
  await connectDB();
  const access = await PortalAccess.findOneAndUpdate(
    { conversionUuid, isActive: true },
    { $set: { lastLoginAt: new Date() } },
    { returnDocument: "after" }
  ).lean();
  if (!access) return null;
  const ctx = await loadPortalContext(access);
  if (!ctx) return null;
  return { access, ...ctx };
}

/** Resolve legacy magic-token links (`/client/{token}`). */
export async function resolvePortalByToken(token: string) {
  if (!token?.trim()) return null;
  await connectDB();
  const tokenHash = hashPortalToken(token);
  const access = await PortalAccess.findOneAndUpdate(
    { tokenHash, isActive: true },
    { $set: { lastLoginAt: new Date() } },
    { returnDocument: "after" }
  ).lean();
  if (!access) return null;
  const ctx = await loadPortalContext(access);
  if (!ctx) return null;
  return { access, ...ctx };
}

/** @deprecated Prefer resolvePortalByUuid — kept for callers that still pass a token or uuid. */
export async function resolvePortal(tokenOrUuid: string) {
  const byUuid = await resolvePortalByUuid(tokenOrUuid);
  if (byUuid) return byUuid;
  return resolvePortalByToken(tokenOrUuid);
}

export function clientPortalPath(conversionUuid: string, suffix = "") {
  const base = `/client-portal/${conversionUuid}`;
  return suffix ? `${base}${suffix.startsWith("/") ? suffix : `/${suffix}`}` : base;
}
