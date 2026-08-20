import { randomBytes, randomUUID } from "crypto";
import { Conversion } from "@/models/os/Conversion";

export function makeConversionIds() {
  const conversionUuid = randomUUID();
  const year = new Date().getFullYear();
  const hex = randomBytes(4).toString("hex").toUpperCase();
  return {
    conversionUuid,
    publicCode: `EC-${year}-${hex}`,
  };
}

export async function createUniqueConversionIds() {
  for (let i = 0; i < 8; i++) {
    const ids = makeConversionIds();
    const clash = await Conversion.findOne({
      $or: [
        { conversionUuid: ids.conversionUuid },
        { publicCode: ids.publicCode },
      ],
    }).lean();
    if (!clash) return ids;
  }
  throw new Error("Could not allocate a unique conversion id");
}

export function isPublicCode(q: string) {
  return /^EC-\d{4}-[A-F0-9]{8}$/i.test(q.trim());
}
