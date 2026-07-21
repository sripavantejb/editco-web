import { Referrer } from "@/models/Referrer";
import {
  PROJECT_TYPES,
  TIER_BONUS,
  type ProjectType,
  type Tier,
} from "@/lib/constants";

/** Code = first letters of name + last digits of phone (or random digits fallback). */
export function generateReferralCode(fullName: string, phone?: string) {
  const letters = fullName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, "X");

  const phoneDigits = (phone || "").replace(/\D/g, "");
  const fromPhone = phoneDigits.slice(-4);
  const digits =
    fromPhone.length === 4
      ? fromPhone
      : Math.floor(1000 + Math.random() * 9000).toString();

  return `${letters}${digits}`;
}

export async function createUniqueReferralCode(
  fullName: string,
  phone?: string
) {
  for (let i = 0; i < 10; i++) {
    // If phone-based code collides, append a small random variation on later tries
    const base = generateReferralCode(fullName, phone);
    const code =
      i === 0
        ? base
        : `${base.slice(0, 4)}${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await Referrer.findOne({ referralCode: code }).lean();
    if (!exists) return code;
  }
  return `EDIT${Date.now().toString().slice(-6)}`;
}

export function tierFromCount(count: number): Tier {
  if (count >= 6) return "elite_partner";
  if (count >= 3) return "growth_partner";
  return "standard";
}

export function baseRewardForProject(projectType: ProjectType) {
  const found = PROJECT_TYPES.find((p) => p.value === projectType);
  return found?.baseReward ?? 3000;
}

export function calculateRewardAmount(
  projectType: ProjectType,
  successfulCountAfterWin: number
) {
  const tier = tierFromCount(successfulCountAfterWin);
  const base = baseRewardForProject(projectType);
  const bonus = TIER_BONUS[tier];
  return {
    tier,
    base,
    bonus,
    rewardAmount: Math.round(base * (1 + bonus)),
  };
}

export async function hashIp(ip: string) {
  const data = new TextEncoder().encode(`${ip}:${process.env.SESSION_SECRET}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
