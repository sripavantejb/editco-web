export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesApproval } from "@/models/sales/SalesApproval";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { decideSalesApproval } from "@/actions/sales/approvals";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

async function decideApprovalForm(formData: FormData) {
  "use server";
  await decideSalesApproval({}, formData);
}

export default async function SalesAdminApprovalsPage() {
  await requireSalesAdminPage();
  const approvals = await SalesApproval.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const employees = await SalesEmployee.find({ _id: { $in: approvals.map((a) => a.requesterEmployeeId) } }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } }).select("name").lean();
  const staffByEmployeeId = new Map(
    employees.map((e) => [String(e._id), staffUsers.find((s) => String(s._id) === String(e.staffUserId))?.name || "—"])
  );

  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <OsPage title="Approval System" subtitle="Discounts, quotations, proposals, and deals awaiting your decision." backHref="/sales/admin" backLabel="Back to dashboard">
      <section className="mb-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Pending ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={String(a._id)} className="rounded-2xl border border-[var(--dash-border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-inter text-sm text-[var(--dash-text)] capitalize">{a.type} · {a.requestedValue || "—"}</p>
                  <p className="font-inter text-xs text-[var(--dash-muted)]">
                    {staffByEmployeeId.get(String(a.requesterEmployeeId))} · {formatDateTime(a.createdAt)}
                  </p>
                  <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">{a.reason}</p>
                </div>
                <form action={decideApprovalForm} className="flex gap-2">
                  <input type="hidden" name="approvalId" value={String(a._id)} />
                  <button type="submit" name="decision" value="approved" className="rounded-full border border-emerald-400/40 px-3 py-1.5 font-inter text-xs text-emerald-300 hover:bg-emerald-400/10">
                    Approve
                  </button>
                  <button type="submit" name="decision" value="rejected" className="rounded-full border border-red-400/40 px-3 py-1.5 font-inter text-xs text-red-300 hover:bg-red-400/10">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pending.length === 0 ? <p className="font-inter text-sm text-[var(--dash-muted)]">Nothing pending.</p> : null}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Decided</h2>
        <OsTable>
          <thead>
            <tr><Th>Type</Th><Th>Requester</Th><Th>Decision</Th><Th>When</Th></tr>
          </thead>
          <tbody>
            {decided.map((a) => (
              <tr key={String(a._id)}>
                <Td className="capitalize">{a.type}</Td>
                <Td>{staffByEmployeeId.get(String(a.requesterEmployeeId))}</Td>
                <Td><OsBadge tone={a.status === "approved" ? "ok" : "bad"}>{a.status}</OsBadge></Td>
                <Td>{a.decidedAt ? formatDateTime(a.decidedAt) : "—"}</Td>
              </tr>
            ))}
          </tbody>
        </OsTable>
      </section>
    </OsPage>
  );
}
