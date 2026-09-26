export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Transaction } from "@/models/os/Transaction";
import { Payment } from "@/models/os/Payment";
import { Invoice } from "@/models/os/Invoice";
import { Project } from "@/models/os/Project";
import { Vendor } from "@/models/os/Vendor";
import { ManualRevenue } from "@/models/os/ManualRevenue";
import { StaffUser } from "@/models/os/StaffUser";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { Lock } from "lucide-react";
import { createTransaction } from "@/actions/os/transactions";
import { OsActionForm } from "@/components/os/OsActionForm";
import { TransactionFields } from "@/components/os/TransactionFields";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsBadge, OsPage, OsStat, OsTable, Td, Th, osInputClass, osSelectClass } from "@/components/os/ui";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import {
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPE_LABELS,
  type TransactionType,
} from "@/lib/os/transactions";
import "@/models/sales/register";

type HistoryEntry = {
  action: "created" | "updated" | "deleted";
  changes?: { field: string; from?: string; to?: string }[];
  by?: string;
  at?: Date;
};

const SOURCES = {
  ledger: "Ledger",
  project: "Project payment",
  invoice: "Invoice paid",
  sales: "Sales deal",
  manual: "Manual revenue",
} as const;
type SourceKey = keyof typeof SOURCES;

type LedgerRow = {
  key: string;
  source: SourceKey;
  direction: "in" | "out";
  title: string;
  detail: string;
  account: string;
  addedBy: string;
  date: Date;
  amount: number;
  href?: string;
  tx?: {
    id: string;
    type: TransactionType;
    category: string;
    party: string;
    paymentMethod: string;
    reference: string;
    notes: string;
    history: HistoryEntry[];
    updatedAt: Date;
  };
};

const ACTION_TONE = { created: "ok", updated: "accent", deleted: "bad" } as const;
const SOURCE_TONE: Record<SourceKey, "neutral" | "ok" | "warn" | "bad" | "accent"> = {
  ledger: "neutral",
  project: "accent",
  invoice: "accent",
  sales: "ok",
  manual: "warn",
};

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return null;
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

function methodLabel(method?: string) {
  if (!method) return "";
  const known = TRANSACTION_PAYMENT_METHOD_LABELS[method as keyof typeof TRANSACTION_PAYMENT_METHOD_LABELS];
  if (known) return known;
  if (method === "bank") return "Bank transfer";
  return method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " ");
}

function accountOf(method?: string, reference?: string) {
  return [methodLabel(method), reference].filter(Boolean).join(" · ");
}

function signed(n: number) {
  return `${n < 0 ? "−" : ""}${formatCurrencyINR(Math.abs(n))}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string; source?: string }>;
}) {
  const staff = await requireOsPage("finance:read");
  const canWrite = hasPermission(staff.permissions, "payments:write");
  const sp = await searchParams;
  const typeFilter = sp.type === "income" || sp.type === "expense" ? sp.type : "";
  const sourceFilter = (sp.source && sp.source in SOURCES ? sp.source : "") as SourceKey | "";
  const month = sp.month || "";
  const range = month ? monthRange(month) : null;

  const [transactions, recentlyTouched, invoices, payments, wonDeals, manualEntries] = await Promise.all([
    Transaction.find({ recordStatus: "active" }).lean(),
    Transaction.find({}).sort({ updatedAt: -1 }).limit(40).select("title type amount history").lean(),
    Invoice.find({ recordStatus: "active", amountPaid: { $gt: 0 } })
      .select("invoiceNumber projectId vendorId billToName amountPaid paymentDate paymentReference updatedBy createdBy updatedAt")
      .lean(),
    Payment.find({ recordStatus: "active" }).lean(),
    SalesDeal.find({ stage: "won", recordStatus: "active" })
      .select("dealName value finalOffer closedAt updatedAt ownerEmployeeId source paymentStatus createdBy updatedBy")
      .lean(),
    ManualRevenue.find({ recordStatus: "active" }).lean(),
  ]);

  const invoiceById = new Map(invoices.map((i) => [String(i._id), i]));
  const projectIds = new Set<string>();
  const vendorIds = new Set<string>();
  for (const i of invoices) {
    if (i.projectId) projectIds.add(String(i.projectId));
    if (i.vendorId) vendorIds.add(String(i.vendorId));
  }
  for (const p of [...payments, ...manualEntries]) {
    if (p.projectId) projectIds.add(String(p.projectId));
    if (p.vendorId) vendorIds.add(String(p.vendorId));
  }
  const ownerIds = [...new Set(wonDeals.map((d) => d.ownerEmployeeId).filter(Boolean).map(String))];

  const [projects, vendors, owners] = await Promise.all([
    projectIds.size ? Project.find({ _id: { $in: [...projectIds] } }).select("name").lean() : [],
    vendorIds.size ? Vendor.find({ _id: { $in: [...vendorIds] } }).select("companyName").lean() : [],
    ownerIds.length ? SalesEmployee.find({ _id: { $in: ownerIds } }).select("staffUserId").lean() : [],
  ]);
  const projectName = new Map(projects.map((p) => [String(p._id), p.name as string]));
  const vendorName = new Map(vendors.map((v) => [String(v._id), v.companyName as string]));

  const rows: LedgerRow[] = [];

  for (const t of transactions) {
    const type = t.type as TransactionType;
    rows.push({
      key: `tx-${t._id}`,
      source: "ledger",
      direction: type === "income" ? "in" : "out",
      title: t.title,
      detail: [t.category, t.party].filter(Boolean).join(" · "),
      account: accountOf(t.paymentMethod, t.reference),
      addedBy: t.createdBy || "",
      date: t.date,
      amount: t.amount,
      tx: {
        id: String(t._id),
        type,
        category: t.category || "",
        party: t.party || "",
        paymentMethod: t.paymentMethod || "upi",
        reference: t.reference || "",
        notes: t.notes || "",
        history: (t.history || []) as HistoryEntry[],
        updatedAt: t.updatedAt,
      },
    });
  }

  const paidViaPayments = new Map<string, number>();
  for (const p of payments) {
    const inv = invoiceById.get(String(p.invoiceId));
    if (!inv) continue;
    paidViaPayments.set(String(inv._id), (paidViaPayments.get(String(inv._id)) || 0) + (p.amount || 0));
    const project = p.projectId ? projectName.get(String(p.projectId)) : "";
    const client = (p.vendorId && vendorName.get(String(p.vendorId))) || inv.billToName;
    rows.push({
      key: `pay-${p._id}`,
      source: "project",
      direction: "in",
      title: project || client || "Project payment",
      detail: [client !== project ? client : "", inv.invoiceNumber, p.notes].filter(Boolean).join(" · "),
      account: accountOf(p.method, p.reference),
      addedBy: p.createdBy || "",
      date: p.paidAt || p.createdAt,
      amount: p.amount,
      href: `/admin/os/invoices/${inv._id}`,
    });
  }

  for (const inv of invoices) {
    const remainder = (inv.amountPaid || 0) - (paidViaPayments.get(String(inv._id)) || 0);
    if (remainder < 0.5) continue;
    const project = inv.projectId ? projectName.get(String(inv.projectId)) : "";
    const client = (inv.vendorId && vendorName.get(String(inv.vendorId))) || inv.billToName;
    rows.push({
      key: `inv-${inv._id}`,
      source: "invoice",
      direction: "in",
      title: project || client || inv.invoiceNumber,
      detail: [client !== project ? client : "", inv.invoiceNumber].filter(Boolean).join(" · "),
      account: inv.paymentReference || "",
      addedBy: inv.updatedBy || inv.createdBy || "",
      date: inv.paymentDate || inv.updatedAt,
      amount: remainder,
      href: `/admin/os/invoices/${inv._id}`,
    });
  }

  const ownerStaffIds = owners.map((o) => String(o.staffUserId));
  const ownerStaff = ownerStaffIds.length
    ? await StaffUser.find({ _id: { $in: ownerStaffIds } }).select("name email").lean()
    : [];
  const staffById = new Map(ownerStaff.map((u) => [String(u._id), u]));
  const ownerEmailByEmployee = new Map(
    owners.map((o) => [String(o._id), staffById.get(String(o.staffUserId))?.email || ""])
  );

  for (const d of wonDeals) {
    const owner = d.ownerEmployeeId ? ownerEmailByEmployee.get(String(d.ownerEmployeeId)) : "";
    rows.push({
      key: `deal-${d._id}`,
      source: "sales",
      direction: "in",
      title: d.dealName,
      detail: [d.source, d.paymentStatus ? `Payment: ${d.paymentStatus}` : ""].filter(Boolean).join(" · "),
      account: "",
      addedBy: owner || d.updatedBy || d.createdBy || "",
      date: d.closedAt || d.updatedAt,
      amount: d.finalOffer || d.value || 0,
    });
  }

  for (const m of manualEntries) {
    const project = m.projectId ? projectName.get(String(m.projectId)) : "";
    const client = m.vendorId ? vendorName.get(String(m.vendorId)) : "";
    rows.push({
      key: `manual-${m._id}`,
      source: "manual",
      direction: "in",
      title: project ? `${m.source} · ${project}` : m.source,
      detail: [client, m.description, m.notes].filter(Boolean).join(" · "),
      account: accountOf(m.paymentMethod, m.reference),
      addedBy: m.createdBy || "",
      date: m.receivedAt || m.createdAt,
      amount: m.amount,
      href: m.projectId ? `/admin/os/projects/${m.projectId}` : "/admin/os/revenue",
    });
  }

  const filtered = rows
    .filter((r) => !typeFilter || (typeFilter === "income" ? r.direction === "in" : r.direction === "out"))
    .filter((r) => !sourceFilter || r.source === sourceFilter)
    .filter((r) => {
      if (!range) return true;
      const d = new Date(r.date);
      return d >= range.start && d < range.end;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const actorEmails = new Set<string>();
  for (const r of rows) if (r.addedBy) actorEmails.add(r.addedBy.toLowerCase());
  for (const t of recentlyTouched) {
    for (const h of (t.history || []) as HistoryEntry[]) if (h.by) actorEmails.add(h.by.toLowerCase());
  }
  const staffUsers = actorEmails.size
    ? await StaffUser.find({ email: { $in: [...actorEmails] } }).select("name email").lean()
    : [];
  const nameByEmail = new Map(staffUsers.map((u) => [u.email.toLowerCase(), u.name || u.email]));
  const who = (email?: string) => (email ? nameByEmail.get(email.toLowerCase()) || email : "—");

  const income = filtered.filter((r) => r.direction === "in").reduce((s, r) => s + r.amount, 0);
  const spent = filtered.filter((r) => r.direction === "out").reduce((s, r) => s + r.amount, 0);
  const bySource = (Object.keys(SOURCES) as SourceKey[]).map((k) => ({
    key: k,
    total: filtered.filter((r) => r.source === k && r.direction === "in").reduce((s, r) => s + r.amount, 0),
  }));

  const recentChanges = recentlyTouched
    .flatMap((r) =>
      ((r.history || []) as HistoryEntry[]).map((h) => ({
        ...h,
        txId: String(r._id),
        title: r.title,
        type: r.type as TransactionType,
        amount: r.amount,
      }))
    )
    .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
    .slice(0, 25);

  const periodLabel = range
    ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(range.start)
    : "All time";
  const hasFilters = Boolean(typeFilter || month || sourceFilter);

  return (
    <OsPage
      title="Transactions"
      subtitle="Every rupee in and out of the company — project payments, invoices, sales deals, manual revenue, and your own income and spends. Ledger changes are emailed to the founders."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? (
          <div className="flex flex-wrap items-center gap-2">
            <SalesModal triggerLabel="Add income" title="Add income">
              <OsActionForm action={createTransaction} submitLabel="Add income" className="grid gap-3">
                <TransactionFields initial={{ type: "income" }} />
              </OsActionForm>
            </SalesModal>
            <SalesModal triggerLabel="Add spent" title="Add spent">
              <OsActionForm action={createTransaction} submitLabel="Add spent" className="grid gap-3">
                <TransactionFields initial={{ type: "expense" }} />
              </OsActionForm>
            </SalesModal>
          </div>
        ) : undefined
      }
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label={`Money in · ${periodLabel}`} value={income} />
        <OsStat label={`Spent · ${periodLabel}`} value={spent} />
        <OsStat label={`Net · ${periodLabel}`} value={signed(income - spent)} />
        <OsStat label="Entries" value={String(filtered.length)} />
      </div>
      <div className="mb-6 flex flex-wrap gap-2 font-inter text-xs">
        {bySource.map((s) => (
          <Link
            key={s.key}
            href={`/admin/os/transactions?source=${s.key}${month ? `&month=${month}` : ""}`}
            className="rounded-full border border-[var(--dash-border)] bg-white px-3 py-1.5 text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            {SOURCES[s.key]} in: <span className="font-medium text-[var(--dash-text)]">{formatCurrencyINR(s.total)}</span>
          </Link>
        ))}
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Type</span>
          <select name="type" defaultValue={typeFilter} className={`${osSelectClass()} w-36`}>
            <option value="">All</option>
            <option value="income">Money in</option>
            <option value="expense">Spent</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Source</span>
          <select name="source" defaultValue={sourceFilter} className={`${osSelectClass()} w-48`}>
            <option value="">All sources</option>
            {(Object.keys(SOURCES) as SourceKey[]).map((k) => (
              <option key={k} value={k}>
                {SOURCES[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Month</span>
          <input type="month" name="month" defaultValue={month} className={`${osInputClass()} w-48`} />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white hover:bg-[#222222]"
        >
          Filter
        </button>
        {hasFilters ? (
          <Link href="/admin/os/transactions" className="h-11 content-center font-inter text-[13px] text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
            Clear
          </Link>
        ) : null}
      </form>

      <OsTable>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Source</Th>
            <Th>Details</Th>
            <Th>Account / method</Th>
            <Th>Added by</Th>
            <Th>Amount</Th>
            <Th>History</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => {
            const isIn = r.direction === "in";
            const history = r.tx ? r.tx.history.slice().reverse() : [];
            const last = history[0];
            return (
              <tr key={r.key}>
                <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
                <Td>
                  <div className="flex flex-col items-start gap-1">
                    <OsBadge tone={r.source === "ledger" ? (isIn ? "ok" : "bad") : SOURCE_TONE[r.source]}>
                      {r.tx ? TRANSACTION_TYPE_LABELS[r.tx.type] : SOURCES[r.source]}
                    </OsBadge>
                  </div>
                </Td>
                <Td>
                  {r.href ? (
                    <Link href={r.href} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                  ) : (
                    <div className="font-medium">{r.title}</div>
                  )}
                  <div className="mt-0.5 text-xs text-[var(--dash-muted)]">{r.detail || "—"}</div>
                  {r.tx?.notes ? <div className="mt-0.5 text-xs text-[var(--dash-faint)]">{r.tx.notes}</div> : null}
                </Td>
                <Td className="text-xs">{r.account || "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{who(r.addedBy)}</Td>
                <Td className={`whitespace-nowrap font-medium ${isIn ? "text-emerald-600" : "text-red-600"}`}>
                  {isIn ? "+" : "−"}
                  {formatCurrencyINR(r.amount)}
                </Td>
                <Td>
                  {r.tx ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-[var(--dash-muted)]">
                        {last ? `${last.action} · ${formatDate(last.at || r.tx.updatedAt)}` : "—"}
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
                  ) : r.href ? (
                    <Link href={r.href} className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
                      View →
                    </Link>
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
                <Td>
                  {r.tx ? (
                    <span
                      title="Transactions are locked once added"
                      className="inline-flex items-center gap-1 text-xs text-[var(--dash-muted)]"
                    >
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                      Locked
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
      {filtered.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No transactions {hasFilters ? "match these filters" : "yet — add your first income or spend"}.
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-[var(--dash-border)] bg-white p-5">
        <h2 className="mb-4 font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
          Recent ledger changes
        </h2>
        {recentChanges.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">Nothing yet.</p>
        ) : (
          <ul className="space-y-3 font-inter text-sm">
            {recentChanges.map((c, i) => (
              <li key={`${c.txId}-${i}`} className="flex flex-wrap items-start justify-between gap-2 border-b border-[#f3f4f6] pb-3 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <OsBadge tone={ACTION_TONE[c.action]}>{c.action}</OsBadge>
                    <span className="font-medium text-[#111111]">{c.title}</span>
                    <span className="text-[var(--dash-muted)]">
                      {TRANSACTION_TYPE_LABELS[c.type]} · {formatCurrencyINR(c.amount)}
                    </span>
                  </div>
                  {c.changes?.length ? (
                    <div className="mt-1 text-xs text-[var(--dash-muted)]">
                      {c.changes.map((ch) => `${ch.field}: ${ch.from || "—"} → ${ch.to || "—"}`).join(" · ")}
                    </div>
                  ) : null}
                </div>
                <div className="text-right text-xs text-[var(--dash-faint)]">
                  {who(c.by)}
                  <br />
                  {c.at ? formatDateTime(c.at) : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </OsPage>
  );
}
