"use server";

import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { sendNewsletterSubscribeAdminEmail } from "@/lib/email";
import type { ActionState } from "@/actions/auth";

function str(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = str(formData, "email").toLowerCase();
  const agreed = formData.get("agreed") === "on" || formData.get("agreed") === "true";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address" };
  }
  if (!agreed) {
    return { error: "Please agree to receive communications" };
  }

  await connectDB();

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    if (existing.recordStatus === "active") {
      return { success: "You're already on the list — we'll keep you posted." };
    }
    existing.recordStatus = "active";
    existing.agreed = true;
    await existing.save();
  } else {
    await NewsletterSubscriber.create({
      email,
      agreed: true,
      source: "footer",
      recordStatus: "active",
    });
  }

  // Notify team (best-effort)
  void sendNewsletterSubscribeAdminEmail({ email });

  return { success: "Subscribed — you'll hear from us with news, offers & openings." };
}
