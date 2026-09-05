export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { createSalesProposal, updateSalesProposalStatus } from "@/actions/sales/proposals";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_PROPOSAL_STATUSES } from "@/lib/sales/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

async function updateProposalStatusForm(formData: FormData) {
  "use server";
  await updateSalesProposalStatus({}, formData);
}

export default async function SalesProposalsPage() {
  const staff = await requireSalesPage("docs.proposals");
  const proposals = await SalesProposal.find({ ownerEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).lean();

  return (
    <OsPage
      title="Proposal Management"
      subtitle="Scope, price, and track proposals through to acceptance."
      actions={
        <SalesModal triggerLabel="New proposal" title="New proposal">
          <OsActionForm action={createSalesProposal} submitLabel="Create proposal" className="grid gap-3">
            <Field label="Title">
              <input name="title" required className={osInputClass()} />
            </Field>
            <Field label="Scope">
              <textarea name="scope" className={osTextareaClass()} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pricing (₹)">
                <input name="pricing" type="number" min={0} className={osInputClass()} />
              </Field>
              <Field label="Timeline">
                <input name="timeline" placeholder="e.g. 4 weeks" className={osInputClass()} />
              </Field>
            </div>
            <Field label="Terms">
              <textarea name="terms" className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr><Th>Title</Th><Th>Pricing</Th><Th>Status</Th><Th>Created</Th><Th>Update</Th></tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr key={String(p._id)}>
              <Td>{p.title}</Td>
              <Td>{formatCurrencyINR(p.pricing || 0)}</Td>
              <Td>
                <OsBadge tone={p.status === "accepted" ? "ok" : p.status === "rejected" ? "bad" : "accent"}>{p.status}</OsBadge>
              </Td>
              <Td>{formatDate(p.createdAt)}</Td>
              <Td>
                <form action={updateProposalStatusForm} className="flex flex-wrap gap-1">
                  <input type="hidden" name="proposalId" value={String(p._id)} />
                  {SALES_PROPOSAL_STATUSES.filter((s) => s !== p.status).map((s) => (
                    <button key={s} type="submit" name="status" value={s} className="rounded-full border border-[var(--dash-border)] px-2 py-1 font-inter text-[10px] text-[var(--dash-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]">
                      {s}
                    </button>
                  ))}
                </form>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {proposals.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No proposals yet.</p> : null}
    </OsPage>
  );
}
