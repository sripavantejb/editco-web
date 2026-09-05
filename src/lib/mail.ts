import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

/** Shared branded shell for every system email — OS notifications and Sales CRM notifications alike. */
export function buildNotificationEmail(input: {
  title: string;
  body?: string;
  eyebrow?: string;
  href?: string;
  ctaLabel?: string;
}) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://editcomedia.com").replace(/\/$/, "");
  const link = input.href ? `${appUrl}${input.href.startsWith("/") ? "" : "/"}${input.href}` : appUrl;

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#151515,#0a0a0a);padding:28px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
                <img src="${LOGO_SRC}" alt="Editco" width="40" height="40" style="display:block;margin:0 auto 10px;border-radius:10px;" />
                <span style="display:inline-block;font-size:11px;letter-spacing:0.18em;color:#c8f542;font-weight:700;text-transform:uppercase;">Editco</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${
                  input.eyebrow
                    ? `<span style="display:inline-block;background:rgba(200,245,66,0.12);color:#c8f542;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:14px;">${input.eyebrow}</span>`
                    : ""
                }
                <h1 style="margin:0 0 12px;color:#f5f5f5;font-size:21px;font-weight:800;line-height:1.3;">${input.title}</h1>
                ${
                  input.body
                    ? `<p style="margin:0 0 26px;color:#a3a3a3;font-size:14px;line-height:1.6;">${input.body}</p>`
                    : ""
                }
                <a href="${link}" style="display:inline-block;background:#c8f542;color:#0a0a0a;font-size:13px;font-weight:700;letter-spacing:0.02em;padding:12px 24px;border-radius:10px;text-decoration:none;">${input.ctaLabel || "Open in Editco →"}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                <p style="margin:0;color:#525252;font-size:11px;line-height:1.5;">
                  Sent by Editco · <a href="${appUrl}" style="color:#737373;text-decoration:underline;">editcomedia.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Fire-and-forget: every caller sits inside a user-facing action (task assignment,
 * notifications, etc.) that must not fail just because the mail server hiccuped.
 */
export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    const t = getTransporter();
    if (!t || !input.to) return;
    await t.sendMail({
      from: `"Editco" <${process.env.SMTP_USER}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html || `<p>${input.text}</p>`,
    });
  } catch (err) {
    console.error("[mail] send failed:", err);
  }
}

/** Convenience wrapper: sends a branded notification email in one call. */
export async function sendNotificationEmail(input: {
  to: string;
  title: string;
  body?: string;
  eyebrow?: string;
  href?: string;
  ctaLabel?: string;
}) {
  await sendMail({
    to: input.to,
    subject: input.title,
    text: input.body || input.title,
    html: buildNotificationEmail(input),
  });
}
