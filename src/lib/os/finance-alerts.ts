import { sendNotificationEmail } from "@/lib/mail";
import { TRANSACTION_ALERT_EMAILS } from "@/lib/os/transactions";

export type FinanceChange = { field: string; from: string; to: string };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Emails every finance add / edit / delete to the founders' inboxes. */
export async function sendFinanceAlert(input: {
  title: string;
  lines: [string, string][];
  actor: string;
  changes?: FinanceChange[];
  eyebrow: string;
  href: string;
}) {
  const details = input.lines
    .filter(([, v]) => v)
    .map(([k, v]) => `<strong style="color:#f5f5f5;">${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
    .join("<br/>");
  const changeLines = input.changes?.length
    ? `<br/><br/><strong style="color:#f5f5f5;">Changes</strong><br/>` +
      input.changes
        .map((c) => `${escapeHtml(c.field)}: ${escapeHtml(c.from || "—")} → ${escapeHtml(c.to || "—")}`)
        .join("<br/>")
    : "";
  const body = `${details}${changeLines}<br/><br/>By ${escapeHtml(input.actor)}`;

  await Promise.all(
    TRANSACTION_ALERT_EMAILS.map((to) =>
      sendNotificationEmail({
        to,
        title: input.title,
        body,
        eyebrow: input.eyebrow,
        href: input.href,
      })
    )
  );
}
