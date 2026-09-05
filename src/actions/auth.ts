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
import { isAdminEmail, isEGAAdminEmail } from "@/lib/admin";
import {
  ensureOsSeeded,
  LEGACY_ADMIN_PASSWORD,
  LEGACY_EGA_PASSWORD,
  loadStaffByEmail,
} from "@/lib/os/staff";
import { StaffUser } from "@/models/os/StaffUser";
import { hashPassword, verifyPassword } from "@/lib/os/password";
import { getSalesLandingPath } from "@/lib/sales/page";
import { ensureSalesDemoSeeded } from "@/lib/sales/seed";

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
  const staff = await loadStaffByEmail(email);
  if (staff) {
    await createAdminSession(email, { userId: staff.userId, role: staff.role });
    redirect((await getSalesLandingPath(email)) || "/admin/os");
  }
  if (await isAdminEmail(email)) {
    await createAdminSession(email);
    redirect((await getSalesLandingPath(email)) || "/admin/os");
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
  const password = String(formData.get("password") || "");

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid admin email" };
  }

  await ensureOsSeeded();
  await ensureSalesDemoSeeded();
  const staff = await StaffUser.findOne({ email, isActive: true });

  if (staff?.passwordHash) {
    if (!verifyPassword(password, staff.passwordHash)) {
      return { error: "Invalid email or password" };
    }
    staff.lastLoginAt = new Date();
    await staff.save();
    await createAdminSession(email, {
      userId: staff._id.toString(),
      role: staff.role,
    });
    redirect((await getSalesLandingPath(email)) || "/admin/os");
  }

  const passwordOk = isEGAAdminEmail(email)
    ? password === LEGACY_EGA_PASSWORD
    : password === LEGACY_ADMIN_PASSWORD;

  if (!passwordOk) {
    return { error: "Invalid email or password" };
  }

  const allowed = Boolean(staff) || (await isAdminEmail(email));
  if (!allowed) {
    return { error: "Invalid email or password" };
  }

  if (staff && !staff.passwordHash) {
    staff.passwordHash = hashPassword(password);
    staff.lastLoginAt = new Date();
    await staff.save();
  } else if (staff) {
    staff.lastLoginAt = new Date();
    await staff.save();
  }

  const ctx = await loadStaffByEmail(email);
  await createAdminSession(email, {
    userId: ctx?.userId,
    role: ctx?.role,
  });
  redirect((await getSalesLandingPath(email)) || "/admin/os");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
