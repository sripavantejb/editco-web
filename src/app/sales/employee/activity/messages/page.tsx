export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

const TEMPLATES = [
  { name: "Introduction", body: "Hi {{name}}, thanks for your interest in Editco — introducing myself and how we can help." },
  { name: "Follow-up", body: "Hi {{name}}, following up on our last conversation. Any questions I can help with?" },
  { name: "Proposal", body: "Hi {{name}}, sharing our proposal for {{company}} — let me know your thoughts." },
  { name: "Quotation", body: "Hi {{name}}, please find the quotation attached. Valid until {{validUntil}}." },
  { name: "Meeting confirmation", body: "Confirming our meeting on {{date}} at {{time}}. Looking forward to it." },
  { name: "Reminder", body: "Hi {{name}}, just a gentle reminder about {{item}}." },
  { name: "Thank you", body: "Thank you for your time, {{name}}! Excited to work together." },
];

export default async function SalesMessagesPage() {
  const staff = await requireSalesPage("comm.email_whatsapp");
  const activity = await SalesActivityEvent.find({
    actorEmployeeId: staff.employeeId,
    type: { $in: ["call_logged", "meeting_created", "followup_completed"] },
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return (
    <OsPage
      title="Email / WhatsApp Activity"
      subtitle="Reusable templates and a log of communication touchpoints. Sending isn't wired to a live Email/WhatsApp provider yet — connect one to send directly from here."
    >
      <section className="mb-8 rounded-[20px] border border-[var(--dash-border)] p-5">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Templates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="rounded-xl border border-[var(--dash-border)] p-3">
              <p className="font-inter text-sm font-medium text-[var(--dash-text)]">{t.name}</p>
              <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Recent activity</h2>
        <ul className="space-y-2">
          {activity.map((a) => (
            <li key={String(a._id)} className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <span className="text-[var(--dash-text)]">{a.title}</span>
              <span className="flex items-center gap-2 text-[var(--dash-faint)]">
                <OsBadge tone="neutral">{a.type.replace("_", " ")}</OsBadge>
                {formatDateTime(a.createdAt)}
              </span>
            </li>
          ))}
          {activity.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No communication activity yet.</li> : null}
        </ul>
      </section>
    </OsPage>
  );
}
