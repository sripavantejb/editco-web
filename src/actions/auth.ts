"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Referrer } from "@/models/Referrer";
import { createUniqueReferralCode } from "@/lib/referral-logic";
import {
  clearAdminSession,
  clearReferrerSession,
  createAdminSession,
  createReferrerSession,
} from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/email";
import { isAdminEmail } from "@/lib/admin";

const joinSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required for your referral code"),
});

const continueSchema = z.object({
  email: z.string().email("Valid email required"),
});

export type ActionState = {
  error?: string;
  success?: string;
};

async function routeAdminIfAllowed(email: string) {
  if (await isAdminEmail(email)) {
    await createAdminSession(email);
    redirect("/admin");
  }
}

export async function joinAsReferrer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = joinSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();

  await routeAdminIfAllowed(email);

  const existing = await Referrer.findOne({ email });

  if (existing) {
    await createReferrerSession({
      referrerId: existing._id.toString(),
      email: existing.email,
      fullName: existing.fullName,
    });
    redirect("/dashboard");
  }

  const phone = parsed.data.phone.trim();
  const referralCode = await createUniqueReferralCode(
    parsed.data.fullName,
    phone
  );
  const referrer = await Referrer.create({
    fullName: parsed.data.fullName.trim(),
    email,
    phone,
    referralCode,
  });

  await createReferrerSession({
    referrerId: referrer._id.toString(),
    email: referrer.email,
    fullName: referrer.fullName,
  });

  await sendWelcomeEmail({
    to: referrer.email,
    fullName: referrer.fullName,
    referralCode: referrer.referralCode,
  });

  redirect("/dashboard");
}

export async function continueWithEmail(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = continueSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid email" };
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();

  await routeAdminIfAllowed(email);

  const referrer = await Referrer.findOne({ email });

  if (!referrer) {
    return {
      error:
        "No referrer account found for that email. Use “New here?” to join first.",
    };
  }

  await createReferrerSession({
    referrerId: referrer._id.toString(),
    email: referrer.email,
    fullName: referrer.fullName,
  });

  redirect("/dashboard");
}

export async function logoutReferrer() {
  await clearReferrerSession();
  redirect("/refer");
}

export async function adminLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid admin email" };
  }

  const allowed = await isAdminEmail(email);
  if (!allowed) {
    return { error: "This email is not on the admin allowlist" };
  }

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
