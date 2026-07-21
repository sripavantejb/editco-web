"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getReferrerSession } from "@/lib/session";
import { Referrer } from "@/models/Referrer";
import { Referral } from "@/models/Referral";
import { ReferralActivity } from "@/models/ReferralActivity";
import {
  sendReferralSubmittedAdmin,
  sendReferralSubmittedReferrer,
  sendWarmIntroEmail,
} from "@/lib/email";
import type { ActionState } from "@/actions/auth";

const referralSchema = z.object({
  referredName: z.string().min(2, "Name is required"),
  referredBusiness: z.string().optional(),
  referredPhone: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
  referredNeeds: z.string().optional(),
  referrerNotes: z.string().optional(),
  mentionReferrerName: z.boolean().optional(),
  consentToIntroEmail: z.boolean().optional(),
});

export async function submitManualReferral(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getReferrerSession();
  if (!session) return { error: "Please sign in again" };

  const needs = formData.getAll("needs").map(String).filter(Boolean);
  const parsed = referralSchema.safeParse({
    referredName: formData.get("referredName"),
    referredBusiness: formData.get("referredBusiness") || undefined,
    referredPhone: formData.get("referredPhone") || undefined,
    referredEmail: formData.get("referredEmail") || "",
    referredNeeds: needs.length ? needs.join(", ") : undefined,
    referrerNotes: formData.get("referrerNotes") || undefined,
    mentionReferrerName: formData.get("mentionReferrerName") === "on",
    consentToIntroEmail: formData.get("consentToIntroEmail") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  if (!parsed.data.referredEmail && !parsed.data.referredPhone) {
    return { error: "Provide at least an email or phone for the referral" };
  }

  await connectDB();
  const referrer = await Referrer.findById(session.referrerId);
  if (!referrer) return { error: "Referrer not found" };

  const email = parsed.data.referredEmail?.toLowerCase().trim() || undefined;
  const phone = parsed.data.referredPhone?.trim() || undefined;

  if (
    (email && email === referrer.email) ||
    (phone && referrer.phone && phone === referrer.phone)
  ) {
    return {
      error:
        "You can't refer yourself. Use the other person's email or phone — not your own.",
    };
  }

  let flaggedDuplicate = false;
  if (email || phone) {
    const duplicate = await Referral.findOne({
      $or: [
        ...(email ? [{ referredEmail: email }] : []),
        ...(phone ? [{ referredPhone: phone }] : []),
      ],
    }).lean();
    if (duplicate) flaggedDuplicate = true;
  }

  const referral = await Referral.create({
    referrerId: referrer._id,
    source: "manual_submission",
    referredName: parsed.data.referredName.trim(),
    referredBusiness: parsed.data.referredBusiness?.trim(),
    referredEmail: email,
    referredPhone: phone,
    referredNeeds: parsed.data.referredNeeds,
    referrerNotes: parsed.data.referrerNotes?.trim(),
    consentToIntroEmail: parsed.data.consentToIntroEmail || false,
    mentionReferrerName: parsed.data.mentionReferrerName || false,
    stage: "submitted",
    flaggedDuplicate,
  });

  await ReferralActivity.create({
    referralId: referral._id,
    eventType: "created",
    toStage: "submitted",
    note: flaggedDuplicate
      ? "Created (flagged possible duplicate for admin review)"
      : "Referral submitted by referrer",
    createdBy: referrer.email,
    referrerVisible: true,
  });

  await sendReferralSubmittedReferrer({
    to: referrer.email,
    referrerName: referrer.fullName,
    referredName: referral.referredName,
  });

  await sendReferralSubmittedAdmin({
    referrerName: referrer.fullName,
    referrerEmail: referrer.email,
    referredName: referral.referredName,
    referredBusiness: referral.referredBusiness || undefined,
    referredEmail: referral.referredEmail || undefined,
    referredPhone: referral.referredPhone || undefined,
    referredNeeds: referral.referredNeeds || undefined,
    referrerNotes: referral.referrerNotes || undefined,
    source: "manual_submission",
  });

  if (referral.consentToIntroEmail && referral.referredEmail) {
    await sendWarmIntroEmail({
      to: referral.referredEmail,
      referredName: referral.referredName,
      referrerName: referrer.fullName,
      needs: referral.referredNeeds || undefined,
      mentionName: referral.mentionReferrerName || false,
    });
  }

  revalidatePath("/dashboard");
  return {
    success: flaggedDuplicate
      ? "Referral submitted (flagged for admin review due to a possible duplicate)."
      : "Referral submitted. Track it on your dashboard.",
  };
}

export async function togglePublicPartner(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getReferrerSession();
  if (!session) return { error: "Please sign in again" };

  await connectDB();
  const referrer = await Referrer.findById(session.referrerId);
  if (!referrer) return { error: "Referrer not found" };

  if (referrer.tier !== "elite_partner") {
    return { error: "Public listing is available for Elite Partners" };
  }

  const enabled = formData.get("enabled") === "true";
  referrer.isPublicPartner = enabled;
  await referrer.save();
  revalidatePath("/dashboard");
  revalidatePath("/partners");
  return {
    success: enabled
      ? "You're listed on the public partner wall"
      : "Removed from the public partner wall",
  };
}
