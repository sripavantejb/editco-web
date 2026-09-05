export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesCall } from "@/models/sales/SalesCall";
import { SalesLead } from "@/models/sales/SalesLead";
import { logSalesCall } from "@/actions/sales/calls";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_CALL_OUTCOME_LABELS, SALES_CALL_OUTCOMES } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

export default async function SalesCallsPage() {
  const staff = await requireSalesPage("comm.calls");
  const calls = await SalesCall.find({ employeeId: staff.employeeId }).sort({ calledAt: -1 }).limit(50).lean();
  const leads = await SalesLead.find({ assignedEmployeeId: staff.employeeId, recordStatus: "active" })
    .select("contactPerson company")
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const leadOptions = [
    { value: "", label: "— No lead —" },
    ...leads.map((l) => ({ value: String(l._id), label: `${l.contactPerson}${l.company ? ` (${l.company})` : ""}` })),
  ];
  const outcomeOptions = SALES_CALL_OUTCOMES.map((o) => ({ value: o, label: SALES_CALL_OUTCOME_LABELS[o] }));

  return (
    <OsPage
      title="Call Tracking"
      subtitle="Log outbound and inbound calls with outcome and next action."
      actions={
        <SalesModal triggerLabel="Log a call" title="Log a call">
          <OsActionForm action={logSalesCall} submitLabel="Save call" className="grid gap-3">
            <Field label="Lead">
              <OsSelect name="leadId" options={leadOptions} defaultValue="" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration (minutes)">
                <input name="durationMinutes" type="number" min={0} className={osInputClass()} />
              </Field>
              <Field label="Outcome">
                <OsSelect name="outcome" options={outcomeOptions} defaultValue="connected" />
              </Field>
            </div>
            <Field label="Notes">
              <textarea name="notes" className={osTextareaClass()} />
            </Field>
            <Field label="Next action">
              <input name="nextAction" className={osInputClass()} />
            </Field>
            <Field label="Next follow-up">
              <input name="nextFollowUpAt" type="datetime-local" className={osInputClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Outcome</Th>
            <Th>Duration</Th>
            <Th>Notes</Th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c) => (
            <tr key={String(c._id)}>
              <Td>{formatDateTime(c.calledAt)}</Td>
              <Td>
                <OsBadge tone={c.outcome === "qualified" || c.outcome === "interested" ? "ok" : c.outcome === "not_interested" ? "bad" : "neutral"}>
                  {SALES_CALL_OUTCOME_LABELS[c.outcome as keyof typeof SALES_CALL_OUTCOME_LABELS]}
                </OsBadge>
              </Td>
              <Td>{c.durationMinutes || 0} min</Td>
              <Td className="max-w-sm truncate">{c.notes || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {calls.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No calls logged yet.</p> : null}
    </OsPage>
  );
}
