export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Invoice } from "@/models/os/Invoice";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { ManualRevenue } from "@/models/os/ManualRevenue";
import { Transaction } from "@/models/os/Transaction";
import { Project } from "@/models/os/Project";
import { Vendor } from "@/models/os/Vendor";
import { StaffUser } from "@/models/os/StaffUser";
import { createManualRevenue, archiveManualRevenue, updateManualRevenue } from "@/actions/os/revenue";
import { archiveInvoice } from "@/actions/os/invoices";
import Link from "next/link";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { OsSelect, type OsSelectOption } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import { Field, OsBadge, OsPage, OsStat, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SalesModal } from "@/components/sales/SalesModal";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import {
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/lib/os/transactions";
import "@/models/sales/register";

type HistoryEntry = {
  action: "created" | "updated" | "deleted";
  changes?: { field: string; from?: string; to?: string }[];
  by?: string;
  at?: Date;
};

type ManualInitial = {
  id?: string;
  source?: string;
  amount?: number;
  receivedAt?: string;
  projectId?: string;
  paymentMethod?: string;
  reference?: string;
  description?: string;
  notes?: string;
};

const ACTION_TONE = { created: "ok", updated: "accent", deleted: "bad" } as const;

function toDateInputValue(d: Date | string | undefined | null) {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function ManualRevenueFields({
  initial = {},
  projectOptions,
}: {
  initial?: ManualInitial;
  projectOptions: OsSelectOption[];
}) {
  return (
    <>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Field label="Project (optional)">
        <OsSelect
          name="projectId"
          defaultValue={initial.projectId || ""}
          placeholder="Not linked to a project"
          options={[{ value: "", label: "Not linked to a project" }, ...projectOptions]}
        />
      </Field>
      <Field label="Source">
        <input
          name="source"
          required
          defaultValue={initial.source || ""}
          placeholder="e.g. Cash sale, Retainer"
          className={osInputClass()}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹)">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={initial.amount ?? ""}
            className={osInputClass()}
          />
        </Field>
        <Field label="Received on">
          <OsDateInput
            name="receivedAt"
            required
            defaultValue={initial.receivedAt || new Date().toISOString().slice(0, 10)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Payment method">
          <OsSelect
            name="paymentMethod"
            defaultValue={initial.paymentMethod || "upi"}
            options={TRANSACTION_PAYMENT_METHODS.map((m) => ({
              value: m,
              label: TRANSACTION_PAYMENT_METHOD_LABELS[m],
            }))}
          />
        </Field>
        <Field label="Reference / UTR">
          <input name="reference" defaultValue={initial.reference || ""} className={osInputClass()} />
        </Field>
      </div>
      <Field label="Description">
        <input name="description" defaultValue={initial.description || ""} className={osInputClass()} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" defaultValue={initial.notes || ""} className={osTextareaClass()} />
      </Field>
    </>
  );
}

export default async function RevenuePage() {
  const staff = await requireOsPage("finance:read");
  const canDeleteManual = hasPermission(staff.permissions, "payments:write");
  const canDeleteInvoice = hasPermission(staff.permissions, "invoices:write");

  const [invoices, wonDeals, manualEntries, transactions, projects] = await Promise.all([
    Invoice.find({ recordStatus: "active" })
      .select("amountPaid paymentDate billToName createdAt projectId updatedBy createdBy")
      .lean(),
    SalesDeal.find({ stage: "won", recordStatus: "active" })
      .select("dealName value finalOffer closedAt updatedAt updatedBy createdBy")
      .lean(),
    ManualRevenue.find({ recordStatus: "active" }).sort({ receivedAt: -1 }).lean(),
    Transaction.find({ recordStatus: "active" }).select("type title category amount date createdBy").lean(),
    Project.find({ recordStatus: "active" }).select("name vendorId").sort({ name: 1 }).lean(),
  ]);

  const vendors = await Vendor.find({
    _id: { $in: projects.map((p) => p.vendorId).filter(Boolean) },
  })
    .select("companyName")
    .lean();
  const vendorName = new Map(vendors.map((v) => [String(v._id), v.companyName as string]));
  const projectName = new Map(projects.map((p) => [String(p._id), p.name as string]));
  const projectOptions: OsSelectOption[] = projects.map((p) => {
    const client = p.vendorId ? vendorName.get(String(p.vendorId)) : "";
    return { value: String(p._id), label: client ? `${p.name} · ${client}` : p.name };
  });

  type RevenueRow = {
    id: string;
    label: string;
    detail: string;
    addedBy: string;
    source: "Sales CRM" | "Editco OS" | "Manual" | "Income" | "Spent";
    amount: number;
    date: Date;
    manual?: ManualInitial & { history: HistoryEntry[] };
  };

  const osRows: RevenueRow[] = invoices
    .filter((i) => (i.amountPaid || 0) > 0)
    .map((i) => ({
      id: String(i._id),
      label: i.billToName || "Invoice",
      detail: i.projectId ? projectName.get(String(i.projectId)) || "" : "",
      addedBy: i.updatedBy || i.createdBy || "",
      source: "Editco OS" as const,
      amount: i.amountPaid || 0,
      date: i.paymentDate || i.createdAt,
    }));

  const salesRows: RevenueRow[] = wonDeals.map((d) => ({
    id: String(d._id),
    label: d.dealName,
    detail: "",
    addedBy: d.updatedBy || d.createdBy || "",
    source: "Sales CRM" as const,
    amount: d.finalOffer || d.value || 0,
    date: d.closedAt || d.updatedAt,
  }));

  const manualRows: RevenueRow[] = manualEntries.map((m) => ({
    id: String(m._id),
    label: m.source,
    detail: [
      m.projectId ? projectName.get(String(m.projectId)) : "",
      m.paymentMethod
        ? TRANSACTION_PAYMENT_METHOD_LABELS[m.paymentMethod as keyof typeof TRANSACTION_PAYMENT_METHOD_LABELS] ||
          m.paymentMethod
        : "",
      m.reference,
      m.description,
    ]
      .filter(Boolean)
      .join(" · "),
    addedBy: m.createdBy || "",
    source: "Manual" as const,
    amount: m.amount,
    date: m.receivedAt,
    manual: {
      id: String(m._id),
      source: m.source,
      amount: m.amount,
      receivedAt: toDateInputValue(m.receivedAt),
      projectId: m.projectId ? String(m.projectId) : "",
      paymentMethod: m.paymentMethod || "",
      reference: m.reference || "",
      description: m.description || "",
      notes: m.notes || "",
      history: (m.history || []) as HistoryEntry[],
    },
  }));

  const txRows: RevenueRow[] = transactions.map((t) => ({
    id: String(t._id),
    label: t.title,
    detail: t.category || "",
    addedBy: t.createdBy || "",
    source: t.type === "income" ? ("Income" as const) : ("Spent" as const),
    amount: t.amount,
    date: t.date,
  }));

  const rows = [...osRows, ...salesRows, ...manualRows, ...txRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const emails = new Set<string>();
  for (const r of rows) {
    if (r.addedBy) emails.add(r.addedBy.toLowerCase());
    for (const h of r.manual?.history || []) if (h.by) emails.add(h.by.toLowerCase());
  }
  const staffUsers = emails.size
    ? await StaffUser.find({ email: { $in: [...emails] } }).select("name email").lean()
    : [];
  const nameByEmail = new Map(staffUsers.map((u) => [u.email.toLowerCase(), u.name || u.email]));
  const who = (email?: string) => (email ? nameByEmail.get(email.toLowerCase()) || email : "—");

  const salesTotal = salesRows.reduce((s, r) => s + r.amount, 0);
  const osTotal = osRows.reduce((s, r) => s + r.amount, 0);
  const manualTotal = manualRows.reduce((s, r) => s + r.amount, 0);
  const incomeTotal = txRows.filter((r) => r.source === "Income").reduce((s, r) => s + r.amount, 0);
  const spentTotal = txRows.filter((r) => r.source === "Spent").reduce((s, r) => s + r.amount, 0);
  const grandTotal = salesTotal + osTotal + manualTotal + incomeTotal;
  const netProfit = grandTotal - spentTotal;

  return (
    <OsPage
      title="Revenue Overview"
      subtitle="Every rupee collected, combined — Sales CRM won deals, Editco OS payments, manual entries, and Transactions. Spends are subtracted for net profit."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        <SalesModal
          triggerLabel="Add manual revenue"
          title="Add manual revenue"
          subtitle="Saved to history and emailed to the founders."
        >
          <OsActionForm action={createManualRevenue} submitLabel="Add entry" className="grid gap-3">
            <ManualRevenueFields projectOptions={projectOptions} />
          </OsActionForm>
        </SalesModal>
      }
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <OsStat label="Total revenue" value={formatCurrencyINR(grandTotal)} />
        <OsStat label="Total spent" value={formatCurrencyINR(spentTotal)} />
        <OsStat
          label="Net profit"
          value={`${netProfit < 0 ? "−" : ""}${formatCurrencyINR(Math.abs(netProfit))}`}
        />
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Sales CRM (won deals)" value={formatCurrencyINR(salesTotal)} />
        <OsStat label="Editco OS (payments)" value={formatCurrencyINR(osTotal)} />
        <OsStat label="Manual entries" value={formatCurrencyINR(manualTotal)} />
        <OsStat label="Transactions income" value={formatCurrencyINR(incomeTotal)} />
      </div>
      <p className="mb-4 font-inter text-xs text-[var(--dash-muted)]">
        Add or edit income and spends in{" "}
        <Link href="/admin/os/transactions" className="underline hover:text-[var(--dash-text)]">
          Transactions
        </Link>
        .
      </p>

      <OsTable>
        <thead>
          <tr>
            <Th>Source</Th>
            <Th>Label</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Added by</Th>
            <Th>History</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const history = r.manual ? r.manual.history.slice().reverse() : [];
            const last = history[0];
            return (
              <tr key={`${r.source}-${r.id}`}>
                <Td>
                  <OsBadge
                    tone={
                      r.source === "Spent"
                        ? "bad"
                        : r.source === "Editco OS"
                          ? "accent"
                          : r.source === "Sales CRM" || r.source === "Income"
                            ? "ok"
                            : "warn"
                    }
                  >
                    {r.source}
                  </OsBadge>
                </Td>
                <Td>
                  <div className="font-medium">{r.label}</div>
                  {r.detail ? <div className="mt-0.5 text-xs text-[var(--dash-muted)]">{r.detail}</div> : null}
                </Td>
                <Td className={r.source === "Spent" ? "text-red-600" : undefined}>
                  {r.source === "Spent" ? "−" : ""}
                  {formatCurrencyINR(r.amount)}
                </Td>
                <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
                <Td className="whitespace-nowrap text-xs">{who(r.addedBy)}</Td>
                <Td>
                  {r.manual && history.length ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-[var(--dash-muted)]">
                        {last.action} · {last.at ? formatDate(last.at) : ""}
                        {history.length > 1 ? ` (${history.length})` : ""}
                      </summary>
                      <ul className="mt-2 w-64 space-y-2 text-xs">
                        {history.map((h, i) => (
                          <li key={i} className="rounded-lg border border-[var(--dash-border)] p-2">
                            <div className="flex items-center justify-between gap-2">
                              <OsBadge tone={ACTION_TONE[h.action]}>{h.action}</OsBadge>
                              <span className="text-[var(--dash-faint)]">{h.at ? formatDateTime(h.at) : ""}</span>
                            </div>
                            <div className="mt-1 text-[var(--dash-muted)]">by {who(h.by)}</div>
                            {h.changes?.map((c, j) => (
                              <div key={j} className="mt-1">
                                <span className="font-medium">{c.field}:</span> {c.from || "—"} → {c.to || "—"}
                              </div>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
                <Td>
                  {r.manual && canDeleteManual ? (
                    <div className="flex items-center gap-1">
                      <SalesModal
                        triggerLabel="Edit"
                        title="Edit manual revenue"
                        subtitle="Changes are saved to the history and emailed."
                        triggerClassName="inline-flex h-8 items-center rounded-lg border border-[var(--dash-border)] px-2.5 font-inter text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                      >
                        <OsActionForm action={updateManualRevenue} submitLabel="Save changes" className="grid gap-3">
                          <ManualRevenueFields initial={r.manual} projectOptions={projectOptions} />
                        </OsActionForm>
                      </SalesModal>
                      <RowDeleteButton
                        action={archiveManualRevenue}
                        id={r.id}
                        confirmMessage={`Delete manual revenue "${r.label}"?`}
                      />
                    </div>
                  ) : r.source === "Income" || r.source === "Spent" ? (
                    <span className="text-xs text-[var(--dash-muted)]" title="Transactions are locked once added">
                      Locked
                    </span>
                  ) : r.source === "Editco OS" && canDeleteInvoice ? (
                    <RowDeleteButton
                      action={archiveInvoice}
                      id={r.id}
                      confirmMessage={`Delete invoice revenue row for "${r.label}"?`}
                    />
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
      {rows.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No revenue recorded yet from any source.</p>
      ) : null}
    </OsPage>
  );
}
