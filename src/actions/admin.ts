"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referrer } from "@/models/Referrer";
import { Referral } from "@/models/Referral";
import { ReferralActivity } from "@/models/ReferralActivity";
import { ReferralClick } from "@/models/ReferralClick";
import {
  calculateRewardAmount,
  hashIp,
  tierFromCount,
} from "@/lib/referral-logic";
import {
  LOST_REASON_LABELS,
  STAGE_LABELS,
  STAGES,
  type ProjectType,
  type Stage,
} from "@/lib/constants";
import {
  sendRewardPaidEmail,
  sendStageChangeEmail,
  sendTierUpgradeEmail,
  sendReferralSubmittedAdmin,
} from "@/lib/email";
import type { ActionState } from "@/actions/auth";
import { redirect } from "next/navigation";

export async function trackReferralClick(params: {
  code: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}) {
  await connectDB();
  const code = params.code.toUpperCase();
  const referrer = await Referrer.findOne({ referralCode: code }).lean();
  if (!referrer) return { ok: false as const };

  const hdrs = await headers();
  const ua = hdrs.get("user-agent") || undefined;
  const forwarded = hdrs.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const ipHash = await hashIp(ip);

  await ReferralClick.create({
    referralCode: code,
    utmSource: params.utmSource,
    utmMedium: params.utmMedium,
    utmCampaign: params.utmCampaign,
    landingPage: params.landingPage,
    userAgent: ua,
    ipHash,
  });

  return { ok: true as const, code };
}

const leadSchema = z.object({
  referredName: z.string().min(2),
  referredBusiness: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
  referredPhone: z.string().optional(),
  referredNeeds: z.string().optional(),
  referralCode: z.string().min(1, "Missing referral code"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  landingPage: z.string().optional(),
});

export async function submitAttributedLead(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const codeRaw = String(formData.get("referralCode") || "").trim();
  if (!codeRaw) {
    return {
      error:
        "No referral code found. Open a shared referral link first, then submit this form.",
    };
  }

  const parsed = leadSchema.safeParse({
    referredName: formData.get("referredName"),
    referredBusiness: formData.get("referredBusiness") || undefined,
    referredEmail: formData.get("referredEmail") || "",
    referredPhone: formData.get("referredPhone") || undefined,
    referredNeeds: formData.get("referredNeeds") || undefined,
    referralCode: codeRaw,
    utmSource: formData.get("utmSource") || undefined,
    utmMedium: formData.get("utmMedium") || undefined,
    utmCampaign: formData.get("utmCampaign") || undefined,
    landingPage: formData.get("landingPage") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  if (!parsed.data.referredEmail && !parsed.data.referredPhone) {
    return { error: "Provide email or phone" };
  }

  await connectDB();
  const referrer = await Referrer.findOne({
    referralCode: parsed.data.referralCode.toUpperCase(),
  });
  if (!referrer) return { error: "Invalid referral code" };

  const email = parsed.data.referredEmail?.toLowerCase().trim() || undefined;
  const phone = parsed.data.referredPhone?.trim() || undefined;

  if (
    (email && email === referrer.email) ||
    (phone && referrer.phone && phone === referrer.phone)
  ) {
    return {
      error:
        "This email or phone matches the referrer. Enter the referred person's details — not the referrer's own contact info.",
    };
  }

  let flaggedDuplicate = false;
  const duplicate = await Referral.findOne({
    $or: [
      ...(email ? [{ referredEmail: email }] : []),
      ...(phone ? [{ referredPhone: phone }] : []),
    ],
  }).lean();
  if (duplicate) flaggedDuplicate = true;

  const firstClick = await ReferralClick.findOne({
    referralCode: referrer.referralCode,
  })
    .sort({ createdAt: 1 })
    .lean();

  const referral = await Referral.create({
    referrerId: referrer._id,
    source: "link_click",
    referredName: parsed.data.referredName.trim(),
    referredBusiness: parsed.data.referredBusiness?.trim(),
    referredEmail: email,
    referredPhone: phone,
    referredNeeds: parsed.data.referredNeeds,
    stage: "submitted",
    flaggedDuplicate,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    landingPage: parsed.data.landingPage,
    firstClickAt: firstClick?.createdAt || new Date(),
  });

  await ReferralActivity.create({
    referralId: referral._id,
    eventType: "created",
    toStage: "submitted",
    note: "Lead captured via referral link",
    createdBy: "system",
    referrerVisible: true,
  });

  await sendReferralSubmittedAdmin({
    referrerName: referrer.fullName,
    referrerEmail: referrer.email,
    referredName: referral.referredName,
    referredBusiness: referral.referredBusiness || undefined,
    referredEmail: referral.referredEmail || undefined,
    referredPhone: referral.referredPhone || undefined,
    referredNeeds: referral.referredNeeds || undefined,
    source: "link_click",
    utm: {
      source: referral.utmSource || undefined,
      medium: referral.utmMedium || undefined,
      campaign: referral.utmCampaign || undefined,
    },
  });

  return { success: "Submitted successfully." };
}

const stageSchema = z.object({
  referralId: z.string().min(1),
  stage: z.enum(STAGES),
  lostReason: z.string().optional(),
  projectType: z.enum(["website", "website_crm", "ai_growth"]).optional(),
  projectValue: z.coerce.number().optional(),
  referrerFacingNote: z.string().optional(),
  adminInternalNote: z.string().optional(),
});

export async function updateReferralStage(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const parsed = stageSchema.safeParse({
    referralId: formData.get("referralId"),
    stage: formData.get("stage"),
    lostReason: formData.get("lostReason") || undefined,
    projectType: formData.get("projectType") || undefined,
    projectValue: formData.get("projectValue") || undefined,
    referrerFacingNote: formData.get("referrerFacingNote") || undefined,
    adminInternalNote: formData.get("adminInternalNote") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { stage } = parsed.data;
  if (stage === "lost" && !parsed.data.lostReason) {
    return { error: "Select a lost reason" };
  }
  if (stage === "won" && !parsed.data.projectType) {
    return { error: "Select a project type to calculate reward" };
  }
  if (stage === "won" && (parsed.data.projectValue == null || Number.isNaN(parsed.data.projectValue))) {
    return { error: "Enter project value" };
  }

  await connectDB();
  const referral = await Referral.findById(parsed.data.referralId);
  if (!referral) return { error: "Referral not found" };

  const fromStage = referral.stage as Stage;
  const referrer = await Referrer.findById(referral.referrerId);
  if (!referrer) return { error: "Referrer not found" };

  let rewardAmount = referral.rewardAmount;
  const previousTier = referrer.tier;

  referral.stage = stage;
  if (stage === "lost") {
    referral.lostReason = parsed.data.lostReason;
    referral.rewardStatus = "not_applicable";
  }
  if (stage === "won") {
    const nextCount = referrer.successfulReferralCount + 1;
    const calc = calculateRewardAmount(
      parsed.data.projectType as ProjectType,
      nextCount
    );
    referral.projectType = parsed.data.projectType;
    referral.projectValue = parsed.data.projectValue;
    referral.rewardAmount = calc.rewardAmount;
    referral.rewardStatus = "pending";
    referral.convertedAt = new Date();
    rewardAmount = calc.rewardAmount;

    referrer.successfulReferralCount = nextCount;
    referrer.tier = calc.tier;
    referrer.totalRewardEarned =
      (referrer.totalRewardEarned || 0) + calc.rewardAmount;
    await referrer.save();

    await ReferralActivity.create({
      referralId: referral._id,
      eventType: "reward_calculated",
      note: `Reward ${calc.rewardAmount} (base ${calc.base} + ${Math.round(calc.bonus * 100)}% tier bonus)`,
      createdBy: admin.email,
      referrerVisible: true,
    });

    if (previousTier !== calc.tier) {
      await sendTierUpgradeEmail({
        to: referrer.email,
        referrerName: referrer.fullName,
        tier: calc.tier,
      });
    }
  }

  if (parsed.data.adminInternalNote) {
    referral.adminInternalNotes = [
      referral.adminInternalNotes,
      parsed.data.adminInternalNote,
    ]
      .filter(Boolean)
      .join("\n---\n");
  }

  await referral.save();

  const referrerNote =
    parsed.data.referrerFacingNote?.trim() ||
    `Status updated to ${STAGE_LABELS[stage]}.${
      stage === "lost" && referral.lostReason
        ? ` Reason: ${LOST_REASON_LABELS[referral.lostReason] || referral.lostReason}.`
        : ""
    }`;

  await ReferralActivity.create({
    referralId: referral._id,
    eventType: "stage_change",
    fromStage,
    toStage: stage,
    note: referrerNote,
    createdBy: admin.email,
    referrerVisible: true,
  });

  if (parsed.data.referrerFacingNote?.trim()) {
    await ReferralActivity.create({
      referralId: referral._id,
      eventType: "note_added",
      note: parsed.data.referrerFacingNote.trim(),
      createdBy: admin.email,
      referrerVisible: true,
    });
  }

  await sendStageChangeEmail({
    to: referrer.email,
    referrerName: referrer.fullName,
    referredName: referral.referredName,
    stage,
    lostReasonLabel: referral.lostReason
      ? LOST_REASON_LABELS[referral.lostReason]
      : undefined,
    rewardAmount: rewardAmount || undefined,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/referrals");
  revalidatePath(`/admin/referrals/${referral._id}`);
  revalidatePath("/dashboard");

  return { success: "Stage updated" };
}

export async function markRewardPaid(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const referralId = String(formData.get("referralId") || "");
  if (!referralId) return { error: "Missing referral" };

  await connectDB();
  const referral = await Referral.findById(referralId);
  if (!referral || referral.stage !== "won") {
    return { error: "Only won referrals can be marked paid" };
  }
  if (referral.rewardStatus === "paid") {
    return { error: "Already paid" };
  }

  const referrer = await Referrer.findById(referral.referrerId);
  if (!referrer) return { error: "Referrer not found" };

  const amount = referral.rewardAmount || 0;
  referral.rewardStatus = "paid";
  await referral.save();

  referrer.totalRewardPaid = (referrer.totalRewardPaid || 0) + amount;
  await referrer.save();

  await ReferralActivity.create({
    referralId: referral._id,
    eventType: "note_added",
    note: `Reward marked paid: ${amount}`,
    createdBy: admin.email,
    referrerVisible: true,
  });

  await sendRewardPaidEmail({
    to: referrer.email,
    referrerName: referrer.fullName,
    referredName: referral.referredName,
    rewardAmount: amount,
  });

  revalidatePath("/admin/rewards");
  revalidatePath("/dashboard");
  return { success: "Marked as paid" };
}

const editReferralSchema = z.object({
  referralId: z.string().min(1),
  referredName: z.string().min(2),
  referredBusiness: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
  referredPhone: z.string().optional(),
  referredNeeds: z.string().optional(),
  referrerNotes: z.string().optional(),
  rewardAmount: z.coerce.number().optional(),
  rewardStatus: z
    .enum(["not_applicable", "pending", "paid"])
    .optional(),
  flaggedDuplicate: z.boolean().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  landingPage: z.string().optional(),
  adminInternalNotes: z.string().optional(),
});

export async function updateReferralDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const parsed = editReferralSchema.safeParse({
    referralId: formData.get("referralId"),
    referredName: formData.get("referredName"),
    referredBusiness: formData.get("referredBusiness") || undefined,
    referredEmail: formData.get("referredEmail") || "",
    referredPhone: formData.get("referredPhone") || undefined,
    referredNeeds: formData.get("referredNeeds") || undefined,
    referrerNotes: formData.get("referrerNotes") || undefined,
    rewardAmount:
      formData.get("rewardAmount") === "" || formData.get("rewardAmount") == null
        ? undefined
        : formData.get("rewardAmount"),
    rewardStatus: formData.get("rewardStatus") || undefined,
    flaggedDuplicate: formData.get("flaggedDuplicate") === "on",
    utmSource: formData.get("utmSource") || undefined,
    utmMedium: formData.get("utmMedium") || undefined,
    utmCampaign: formData.get("utmCampaign") || undefined,
    landingPage: formData.get("landingPage") || undefined,
    adminInternalNotes: formData.get("adminInternalNotes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await connectDB();
  const referral = await Referral.findById(parsed.data.referralId);
  if (!referral) return { error: "Referral not found" };

  referral.referredName = parsed.data.referredName.trim();
  referral.referredBusiness = parsed.data.referredBusiness?.trim() || undefined;
  referral.referredEmail =
    parsed.data.referredEmail?.toLowerCase().trim() || undefined;
  referral.referredPhone = parsed.data.referredPhone?.trim() || undefined;
  referral.referredNeeds = parsed.data.referredNeeds?.trim() || undefined;
  referral.referrerNotes = parsed.data.referrerNotes?.trim() || undefined;
  referral.flaggedDuplicate = Boolean(parsed.data.flaggedDuplicate);
  referral.utmSource = parsed.data.utmSource?.trim() || undefined;
  referral.utmMedium = parsed.data.utmMedium?.trim() || undefined;
  referral.utmCampaign = parsed.data.utmCampaign?.trim() || undefined;
  referral.landingPage = parsed.data.landingPage?.trim() || undefined;

  if (parsed.data.adminInternalNotes !== undefined) {
    referral.adminInternalNotes =
      parsed.data.adminInternalNotes.trim() || undefined;
  }
  if (parsed.data.rewardAmount != null && !Number.isNaN(parsed.data.rewardAmount)) {
    referral.rewardAmount = parsed.data.rewardAmount;
  }
  if (parsed.data.rewardStatus) {
    referral.rewardStatus = parsed.data.rewardStatus;
  }

  await referral.save();

  await ReferralActivity.create({
    referralId: referral._id,
    eventType: "note_added",
    note: "Referral details updated by admin",
    createdBy: admin.email,
    referrerVisible: false,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/referrals/${referral._id}`);
  revalidatePath("/dashboard");
  return { success: "Referral updated" };
}

export async function deleteReferral(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const referralId = String(formData.get("referralId") || "");
  if (!referralId) return { error: "Missing referral" };

  await connectDB();
  const referral = await Referral.findById(referralId);
  if (!referral) return { error: "Referral not found" };

  const referrer = await Referrer.findById(referral.referrerId);
  if (referrer && referral.stage === "won") {
    const amount = referral.rewardAmount || 0;
    referrer.successfulReferralCount = Math.max(
      0,
      (referrer.successfulReferralCount || 0) - 1
    );
    referrer.tier = tierFromCount(referrer.successfulReferralCount);
    referrer.totalRewardEarned = Math.max(
      0,
      (referrer.totalRewardEarned || 0) - amount
    );
    if (referral.rewardStatus === "paid") {
      referrer.totalRewardPaid = Math.max(
        0,
        (referrer.totalRewardPaid || 0) - amount
      );
    }
    await referrer.save();
  }

  await ReferralActivity.deleteMany({ referralId: referral._id });
  await referral.deleteOne();

  revalidatePath("/admin");
  revalidatePath("/admin/rewards");
  revalidatePath("/dashboard");
  redirect("/admin");
}

const editReferrerSchema = z.object({
  referrerId: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  referralCode: z.string().min(4),
  tier: z.enum(["standard", "growth_partner", "elite_partner"]),
  isPublicPartner: z.boolean().optional(),
});

export async function updateReferrerDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const parsed = editReferrerSchema.safeParse({
    referrerId: formData.get("referrerId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    referralCode: formData.get("referralCode"),
    tier: formData.get("tier"),
    isPublicPartner: formData.get("isPublicPartner") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await connectDB();
  const referrer = await Referrer.findById(parsed.data.referrerId);
  if (!referrer) return { error: "Referrer not found" };

  const code = parsed.data.referralCode.toUpperCase().trim();
  const email = parsed.data.email.toLowerCase().trim();

  const codeTaken = await Referrer.findOne({
    referralCode: code,
    _id: { $ne: referrer._id },
  }).lean();
  if (codeTaken) return { error: "Referral code already in use" };

  const emailTaken = await Referrer.findOne({
    email,
    _id: { $ne: referrer._id },
  }).lean();
  if (emailTaken) return { error: "Email already in use" };

  referrer.fullName = parsed.data.fullName.trim();
  referrer.email = email;
  referrer.phone = parsed.data.phone?.trim() || undefined;
  referrer.referralCode = code;
  referrer.tier = parsed.data.tier;
  referrer.isPublicPartner = Boolean(parsed.data.isPublicPartner);
  await referrer.save();

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: "Referrer updated" };
}

export async function deleteReferrer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const referrerId = String(formData.get("referrerId") || "");
  if (!referrerId) return { error: "Missing referrer" };

  await connectDB();
  const referrer = await Referrer.findById(referrerId);
  if (!referrer) return { error: "Referrer not found" };

  const referrals = await Referral.find({ referrerId: referrer._id }).lean();
  const referralIds = referrals.map((r) => r._id);
  await ReferralActivity.deleteMany({ referralId: { $in: referralIds } });
  await Referral.deleteMany({ referrerId: referrer._id });
  await ReferralClick.deleteMany({ referralCode: referrer.referralCode });
  await referrer.deleteOne();

  revalidatePath("/admin");
  revalidatePath("/admin/rewards");
  revalidatePath("/dashboard");
  return { success: "Referrer deleted" };
}
