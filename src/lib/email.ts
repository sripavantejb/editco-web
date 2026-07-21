import { Resend } from "resend";
import { STAGE_LABELS, TIER_LABELS, type Stage, type Tier } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM || "Editco Media <onboarding@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "team@editcomedia.com";

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,Helvetica,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 28px 12px;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#ff4e00;font-weight:700;">Editco Media</div>
          <h1 style="margin:12px 0 0;font-size:22px;line-height:1.25;color:#ffffff;text-transform:uppercase;letter-spacing:0.02em;">${title}</h1>
        </td></tr>
        <tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.6;color:#cfcfd6;">
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:#8b8b97;">
          Referral Program · editcomedia.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string) {
  return `<p style="margin:24px 0 8px;">
    <a href="${href}" style="display:inline-block;background:#ff4e00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">${label}</a>
  </p>`;
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email:dev] to=${to} subject=${subject}`);
    return { ok: true as const, skipped: true };
  }
  try {
    await resend.emails.send({ from, to, subject, html });
    return { ok: true as const };
  } catch (error) {
    console.error("Email send failed", error);
    return { ok: false as const, error };
  }
}

export async function sendWelcomeEmail(params: {
  to: string;
  fullName: string;
  referralCode: string;
}) {
  const link = `${appUrl}/dashboard`;
  const html = shell(
    `Welcome aboard, ${params.fullName.split(" ")[0]}`,
    `<p>You're in the Editco Referral Program. Your code is <strong style="color:#fff;">${params.referralCode}</strong>.</p>
     <p>Open your dashboard to add your first referral or share your unique link.</p>
     ${cta(link, "Open Referral Dashboard")}`
  );
  return send(params.to, "Welcome to the Editco Referral Program", html);
}

export async function sendReferralSubmittedReferrer(params: {
  to: string;
  referrerName: string;
  referredName: string;
}) {
  const html = shell(
    "We've got your referral",
    `<p>Hi ${params.referrerName.split(" ")[0]},</p>
     <p>Thanks for referring <strong style="color:#fff;">${params.referredName}</strong>. Our team will reach out within 2 business days.</p>
     ${cta(`${appUrl}/dashboard`, "Track progress")}`
  );
  return send(params.to, `Referral received: ${params.referredName}`, html);
}

export async function sendReferralSubmittedAdmin(params: {
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredBusiness?: string;
  referredEmail?: string;
  referredPhone?: string;
  referredNeeds?: string;
  referrerNotes?: string;
  source: string;
  utm?: { source?: string; medium?: string; campaign?: string };
}) {
  const html = shell(
    "New referral submitted",
    `<p><strong style="color:#fff;">Referrer:</strong> ${params.referrerName} (${params.referrerEmail})</p>
     <p><strong style="color:#fff;">Lead:</strong> ${params.referredName}${params.referredBusiness ? ` · ${params.referredBusiness}` : ""}</p>
     <p><strong style="color:#fff;">Contact:</strong> ${params.referredEmail || "—"} · ${params.referredPhone || "—"}</p>
     <p><strong style="color:#fff;">Needs:</strong> ${params.referredNeeds || "—"}</p>
     <p><strong style="color:#fff;">Notes:</strong> ${params.referrerNotes || "—"}</p>
     <p><strong style="color:#fff;">Source:</strong> ${params.source}</p>
     ${
       params.utm
         ? `<p><strong style="color:#fff;">UTM:</strong> ${params.utm.source || "—"} / ${params.utm.medium || "—"} / ${params.utm.campaign || "—"}</p>`
         : ""
     }
     ${cta(`${appUrl}/admin`, "Open admin")}`
  );
  return send(adminEmail, `New referral: ${params.referredName}`, html);
}

export async function sendWarmIntroEmail(params: {
  to: string;
  referredName: string;
  referrerName: string;
  needs?: string;
  mentionName: boolean;
}) {
  const who = params.mentionName ? params.referrerName : "Someone you know";
  const html = shell(
    "A quick intro to Editco",
    `<p>Hi ${params.referredName.split(" ")[0]},</p>
     <p>${who} thought Editco could help${params.needs ? ` with ${params.needs}` : ""}.</p>
     <p>We build websites, AI calling agents, CRM systems, and automations for clinics, startups, and local businesses.</p>
     ${cta(`${appUrl}/refer`, "Book a free call")}`
  );
  return send(params.to, `${who} thought you might like Editco`, html);
}

export async function sendStageChangeEmail(params: {
  to: string;
  referrerName: string;
  referredName: string;
  stage: Stage;
  lostReasonLabel?: string;
  rewardAmount?: number;
}) {
  let body = `<p>Hi ${params.referrerName.split(" ")[0]},</p>
    <p>Your referral for <strong style="color:#fff;">${params.referredName}</strong> moved to <strong style="color:#fff;">${STAGE_LABELS[params.stage]}</strong>.</p>`;

  if (params.stage === "won" && params.rewardAmount != null) {
    body += `<p>Congratulations — your reward is <strong style="color:#fff;">${formatCurrencyINR(params.rewardAmount)}</strong>. Payouts are typically processed within 14 days after project kickoff.</p>`;
  }
  if (params.stage === "lost") {
    body += `<p>Not moving forward this time — ${params.lostReasonLabel || "timing wasn't right"}. Thanks for referring them; keep sharing when you meet a good fit.</p>`;
  }

  body += cta(`${appUrl}/dashboard`, "View dashboard");
  return send(
    params.to,
    `Update: ${params.referredName} → ${STAGE_LABELS[params.stage]}`,
    shell("Referral update", body)
  );
}

export async function sendRewardPaidEmail(params: {
  to: string;
  referrerName: string;
  referredName: string;
  rewardAmount: number;
}) {
  const html = shell(
    "Reward paid",
    `<p>Hi ${params.referrerName.split(" ")[0]},</p>
     <p>We've marked your reward of <strong style="color:#fff;">${formatCurrencyINR(params.rewardAmount)}</strong> for referring ${params.referredName} as paid.</p>
     ${cta(`${appUrl}/dashboard`, "View dashboard")}`
  );
  return send(params.to, "Your Editco referral reward was paid", html);
}

export async function sendTierUpgradeEmail(params: {
  to: string;
  referrerName: string;
  tier: Tier;
}) {
  const bonus =
    params.tier === "elite_partner"
      ? "30%"
      : params.tier === "growth_partner"
        ? "20%"
        : "0%";
  const html = shell(
    `You're now a ${TIER_LABELS[params.tier]}`,
    `<p>Hi ${params.referrerName.split(" ")[0]},</p>
     <p>You've unlocked the <strong style="color:#fff;">${TIER_LABELS[params.tier]}</strong> badge${bonus !== "0%" ? ` with a +${bonus} reward bonus` : ""}.</p>
     ${cta(`${appUrl}/dashboard`, "See your new badge")}`
  );
  return send(params.to, `Tier upgrade: ${TIER_LABELS[params.tier]}`, html);
}
