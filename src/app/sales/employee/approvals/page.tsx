export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesApproval } from "@/models/sales/SalesApproval";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { requestSalesApproval } from "@/actions/sales/approvals";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_APPROVAL_TYPES } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

export default async function SalesApprovalsPage() {
  const staff = await requireSalesPage("admin.approvals");
  const [approvals, deals] = await Promise.all([
    SalesApproval.find({ requesterEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(30).lean(),
    SalesDeal.find({ ownerEmployeeId: staff.employeeId, recordStatus: "active" }).select("dealName").lean(),
  ]);

  const typeOptions = SALES_APPROVAL_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));
  const dealOptions = [{ value: "", label: "— No deal —" }, ...deals.map((d) => ({ value: String(d._id), label: d.dealName }))];

  return (
    <OsPage
      title="Approval System"
      subtitle="Request approval for discounts, quotations, proposals, or deal terms."
      actions={
        <SalesModal triggerLabel="Request approval" title="Request approval">
          <OsActionForm action={requestSalesApproval} submitLabel="Send request" className="grid gap-3">
            <Field label="Type">
              <OsSelect name="type" options={typeOptions} defaultValue="discount" />
            </Field>
            <Field label="Deal">
              <OsSelect name="dealId" options={dealOptions} defaultValue="" />
            </Field>
            <Field label="Requested value">
              <input name="requestedValue" placeholder="e.g. 20% discount" className={osInputClass()} />
            </Field>
            <Field label="Reason">
              <textarea name="reason" required className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr><Th>Type</Th><Th>Requested</Th><Th>Reason</Th><Th>Status</Th><Th>Requested</Th></tr>
        </thead>
        <tbody>
          {approvals.map((a) => (
            <tr key={String(a._id)}>
              <Td className="capitalize">{a.type}</Td>
              <Td>{a.requestedValue || "—"}</Td>
              <Td className="max-w-xs truncate">{a.reason}</Td>
              <Td>
                <OsBadge tone={a.status === "approved" ? "ok" : a.status === "rejected" ? "bad" : "warn"}>{a.status}</OsBadge>
              </Td>
              <Td>{formatDateTime(a.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {approvals.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No approval requests yet.</p> : null}
    </OsPage>
  );
}
