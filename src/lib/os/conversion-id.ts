import { randomUUID } from "crypto";
import { Conversion } from "@/models/os/Conversion";

export const CONVERSION_CODE_PREFIX = "ECM";

/** `ECM2026001` — prefix + year + per-year serial, starting at 001. */
export function conversionCode(year: number, serial: number) {
  return `${CONVERSION_CODE_PREFIX}${year}${String(serial).padStart(3, "0")}`;
}

const LEGACY_CODE = /^EC-\d{4}-[A-F0-9]{8}$/i;
const CURRENT_CODE = /^ECM\d{4}\d{3,}$/i;

/** Accepts both the current serial codes and the pre-2026 random ones. */
export function isPublicCode(q: string) {
  const value = q.trim();
  return CURRENT_CODE.test(value) || LEGACY_CODE.test(value);
}

/**
 * Serials are allocated by reading the current high-water mark for the year.
 * Two conversions created in the same instant can pick the same number, so the
 * unique index on publicCode is the real guard and we retry on a clash.
 */
export async function createUniqueConversionIds() {
  const year = new Date().getFullYear();
  const prefix = `${CONVERSION_CODE_PREFIX}${year}`;

  const thisYear = await Conversion.find({
    publicCode: { $regex: `^${prefix}\\d+$`, $options: "i" },
  })
    .select("publicCode")
    .lean();

  // Numeric max, not lexicographic — "1000" sorts below "999" as a string.
  let nextSerial = 1;
  for (const c of thisYear) {
    const serial = Number(String(c.publicCode).slice(prefix.length));
    if (Number.isFinite(serial) && serial >= nextSerial) nextSerial = serial + 1;
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const publicCode = conversionCode(year, nextSerial + attempt);
    const conversionUuid = randomUUID();
    const clash = await Conversion.findOne({
      $or: [{ conversionUuid }, { publicCode }],
    })
      .select("_id")
      .lean();
    if (!clash) return { conversionUuid, publicCode };
  }

  throw new Error("Could not allocate a unique conversion id");
}
