export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { SalesLead } from "@/models/sales/SalesLead";
import { createSalesMeeting, updateSalesMeetingStatus } from "@/actions/sales/meetings";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_MEETING_STATUSES, SALES_MEETING_STATUS_LABELS, SALES_MEETING_TYPES } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

async function updateMeetingStatusForm(formData: FormData) {
  "use server";
  await updateSalesMeetingStatus({}, formData);
}

export default async function SalesMeetingsPage() {
  const staff = await requireSalesPage("comm.meetings");
  const meetings = await SalesMeeting.find({ ownerEmployeeId: staff.employeeId }).sort({ startsAt: -1 }).limit(50).lean();
  const leads = await SalesLead.find({ assignedEmployeeId: staff.employeeId, recordStatus: "active" })
    .select("contactPerson company")
    .limit(50)
    .lean();

  const leadOptions = [
    { value: "", label: "— No lead —" },
    ...leads.map((l) => ({ value: String(l._id), label: `${l.contactPerson}${l.company ? ` (${l.company})` : ""}` })),
  ];
  const typeOptions = SALES_MEETING_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

  return (
    <OsPage
      title="Meeting Management"
      subtitle="Schedule and track customer meetings."
      actions={
        <SalesModal triggerLabel="Schedule a meeting" title="Schedule a meeting">
          <OsActionForm action={createSalesMeeting} submitLabel="Schedule" className="grid gap-3">
            <Field label="Title">
              <input name="title" required className={osInputClass()} />
            </Field>
            <Field label="Lead">
              <OsSelect name="leadId" options={leadOptions} defaultValue="" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <OsSelect name="type" options={typeOptions} defaultValue="discovery" />
              </Field>
              <Field label="Date & time">
                <input name="startsAt" type="datetime-local" required className={osInputClass()} />
              </Field>
            </div>
            <Field label="Location / meeting link">
              <input name="location" className={osInputClass()} />
            </Field>
            <Field label="Agenda">
              <textarea name="agenda" className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Meeting</Th>
            <Th>When</Th>
            <Th>Status</Th>
            <Th>Update</Th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m) => (
            <tr key={String(m._id)}>
              <Td>{m.title}</Td>
              <Td>{formatDateTime(m.startsAt)}</Td>
              <Td>
                <OsBadge tone={m.status === "completed" ? "ok" : m.status === "cancelled" || m.status === "no_show" ? "bad" : "accent"}>
                  {SALES_MEETING_STATUS_LABELS[m.status as keyof typeof SALES_MEETING_STATUS_LABELS]}
                </OsBadge>
              </Td>
              <Td>
                <form action={updateMeetingStatusForm} className="flex flex-wrap gap-1">
                  <input type="hidden" name="meetingId" value={String(m._id)} />
                  {SALES_MEETING_STATUSES.filter((s) => s !== m.status).map((s) => (
                    <button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      className="rounded-full border border-[var(--dash-border)] px-2 py-1 font-inter text-[10px] text-[var(--dash-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                    >
                      {SALES_MEETING_STATUS_LABELS[s]}
                    </button>
                  ))}
                </form>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {meetings.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No meetings scheduled yet.</p> : null}
    </OsPage>
  );
}
