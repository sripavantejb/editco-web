export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { updateSalesLeadStatus, updateSalesLeadQualification, deleteSalesLead } from "@/actions/sales/leads";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { salesLeadTone } from "@/lib/sales/tone";
import { formatDateTime } from "@/lib/utils";

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const staff = await requireSalesPage("leads.management");
  const { leadId } = await params;
  if (!Types.ObjectId.isValid(leadId)) notFound();

  const lead = await SalesLead.findById(leadId).lean();
  if (!lead) notFound();
  if (!staff.isSalesAdmin && String(lead.assignedEmployeeId) !== staff.employeeId) notFound();

  const timeline = await SalesActivityEvent.find({ leadId: lead._id }).sort({ createdAt: -1 }).limit(30).lean();

  return (
    <OsPage
      title={lead.contactPerson}
      subtitle={lead.company || "No company on file"}
      backHref="/sales/employee/leads"
      backLabel="Back to leads"
    >
      <div className="mb-6 flex items-center gap-2">
        <OsBadge tone={salesLeadTone(lead.status)}>{SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}</OsBadge>
        <span className="font-inter text-sm text-[var(--dash-muted)]">{lead.email || lead.phone || "No contact info"}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Status</h2>
          <OsActionForm action={updateSalesLeadStatus} submitLabel="Update status" className="grid gap-3">
            <input type="hidden" name="leadId" value={leadId} />
            <Field label="Status">
              <OsSelect
                name="status"
                options={Object.entries(SALES_LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                defaultValue={lead.status}
              />
            </Field>
          </OsActionForm>
          <OsActionForm action={deleteSalesLead} submitLabel="Remove lead" className="mt-4">
            <input type="hidden" name="leadId" value={leadId} />
          </OsActionForm>
        </section>

        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
            Qualification
          </h2>
          <OsActionForm action={updateSalesLeadQualification} submitLabel="Save qualification" className="grid gap-3">
            <input type="hidden" name="leadId" value={leadId} />
            <Field label="Requirements / business need">
              <textarea name="businessNeed" defaultValue={lead.businessNeed} className={osTextareaClass()} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget">
                <input name="budget" type="number" defaultValue={lead.budget || 0} className={osInputClass()} />
              </Field>
              <Field label="Probability %">
                <input name="probability" type="number" min={0} max={100} defaultValue={lead.probability || 0} className={osInputClass()} />
              </Field>
            </div>
            <Field label="Timeline">
              <input name="timeline" defaultValue={lead.timeline} className={osInputClass()} />
            </Field>
            <Field label="Decision maker">
              <input name="decisionMaker" defaultValue={lead.decisionMaker} className={osInputClass()} />
            </Field>
            <Field label="Next action">
              <input name="nextAction" defaultValue={lead.nextAction} className={osInputClass()} />
            </Field>
            <Field label="Qualification notes">
              <textarea name="qualificationNotes" defaultValue={lead.qualificationNotes} className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Activity timeline</h2>
        <ul className="space-y-2">
          {timeline.map((event) => (
            <li key={String(event._id)} className="rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <span className="text-[var(--dash-text)]">{event.title}</span>
              <span className="ml-2 text-[var(--dash-faint)]">{formatDateTime(event.createdAt)}</span>
            </li>
          ))}
          {timeline.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</li> : null}
        </ul>
      </section>
    </OsPage>
  );
}
