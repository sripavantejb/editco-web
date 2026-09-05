export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { SalesLead } from "@/models/sales/SalesLead";
import { createSalesFollowUp, updateSalesFollowUpStatus } from "@/actions/sales/followups";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, Td, Th, OsTable, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_FOLLOWUP_TYPES } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

async function updateFollowUpStatusForm(formData: FormData) {
  "use server";
  await updateSalesFollowUpStatus({}, formData);
}

export default async function SalesFollowUpsPage() {
  const staff = await requireSalesPage("comm.followups");
  const now = new Date();

  const [pending, leads] = await Promise.all([
    SalesFollowUp.find({ ownerEmployeeId: staff.employeeId, status: "pending" }).sort({ dueAt: 1 }).lean(),
    SalesLead.find({ assignedEmployeeId: staff.employeeId, recordStatus: "active" }).select("contactPerson company").lean(),
  ]);

  const overdue = pending.filter((f) => new Date(f.dueAt) < now);
  const today = pending.filter((f) => {
    const d = new Date(f.dueAt);
    return d >= new Date(now.toDateString()) && d.toDateString() === now.toDateString();
  });
  const upcoming = pending.filter((f) => new Date(f.dueAt) > now && !today.includes(f));

  const groups: { title: string; items: typeof pending; tone: "bad" | "accent" | "neutral" }[] = [
    { title: "Missed / Overdue", items: overdue, tone: "bad" },
    { title: "Today's Follow-ups", items: today, tone: "accent" },
    { title: "Upcoming Follow-ups", items: upcoming, tone: "neutral" },
  ];

  const leadOptions = [
    { value: "", label: "— No lead —" },
    ...leads.map((l) => ({ value: String(l._id), label: `${l.contactPerson}${l.company ? ` (${l.company})` : ""}` })),
  ];
  const typeOptions = SALES_FOLLOWUP_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

  return (
    <OsPage
      title="Follow-up Management"
      subtitle="Stay on top of every promised next touch."
      actions={
        <SalesModal triggerLabel="Schedule a follow-up" title="Schedule a follow-up">
          <OsActionForm action={createSalesFollowUp} submitLabel="Schedule" className="grid gap-3">
            <Field label="Lead">
              <OsSelect name="leadId" options={leadOptions} defaultValue="" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <OsSelect name="type" options={typeOptions} defaultValue="call" />
              </Field>
              <Field label="Due">
                <input name="dueAt" type="datetime-local" required className={osInputClass()} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea name="notes" className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 flex items-center gap-2 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
              {group.title} <OsBadge tone={group.tone}>{group.items.length}</OsBadge>
            </h2>
            <OsTable>
              <thead>
                <tr>
                  <Th>Due</Th>
                  <Th>Type</Th>
                  <Th>Notes</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((f) => (
                  <tr key={String(f._id)}>
                    <Td>{formatDateTime(f.dueAt)}</Td>
                    <Td className="capitalize">{f.type}</Td>
                    <Td className="max-w-sm truncate">{f.notes || "—"}</Td>
                    <Td>
                      <form action={updateFollowUpStatusForm} className="flex gap-1">
                        <input type="hidden" name="followUpId" value={String(f._id)} />
                        <button type="submit" name="status" value="completed" className="rounded-full border border-[var(--dash-border)] px-2 py-1 font-inter text-[10px] text-[var(--dash-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]">
                          Complete
                        </button>
                        <button type="submit" name="status" value="cancelled" className="rounded-full border border-[var(--dash-border)] px-2 py-1 font-inter text-[10px] text-[var(--dash-muted)] hover:border-red-400 hover:text-red-400">
                          Cancel
                        </button>
                      </form>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </OsTable>
            {group.items.length === 0 ? <p className="mt-2 font-inter text-xs text-[var(--dash-muted)]">Nothing here.</p> : null}
          </section>
        ))}
      </div>
    </OsPage>
  );
}
