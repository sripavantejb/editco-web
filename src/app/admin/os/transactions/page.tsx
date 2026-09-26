export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Transaction } from "@/models/os/Transaction";
import { StaffUser } from "@/models/os/StaffUser";
import {
  archiveTransaction,
  createTransaction,
  updateTransaction,
} from "@/actions/os/transactions";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { TransactionFields } from "@/components/os/TransactionFields";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsBadge, OsPage, OsStat, OsTable, Td, Th, osInputClass, osSelectClass } from "@/components/os/ui";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import {
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPE_LABELS,
  type TransactionPaymentMethod,
  type TransactionType,
} from "@/lib/os/transactions";

type HistoryEntry = {
  action: "created" | "updated" | "deleted";
  changes?: { field: string; from?: string; to?: string }[];
  by?: string;
  at?: Date;
};

const ACTION_TONE = { created: "ok", updated: "accent", deleted: "bad" } as const;

function toDateInputValue(d: Date | string | undefined) {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return null;
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string }>;
}) {
  const staff = await requireOsPage("finance:read");
  const canWrite = hasPermission(staff.permissions, "payments:write");
  const sp = await searchParams;
  const typeFilter = sp.type === "income" || sp.type === "expense" ? sp.type : "";
  const month = sp.month || "";
  const range = month ? monthRange(month) : null;

  const query: Record<string, unknown> = { recordStatus: "active" };
  if (typeFilter) query.type = typeFilter;
  if (range) query.date = { $gte: range.start, $lt: range.end };

  const [rows, recentlyTouched] = await Promise.all([
    Transaction.find(query).sort({ date: -1, createdAt: -1 }).lean(),
    Transaction.find({}).sort({ updatedAt: -1 }).limit(40).select("title type amount history").lean(),
  ]);

  const actorEmails = new Set<string>();
  for (const r of [...rows, ...recentlyTouched]) {
    for (const h of (r.history || []) as HistoryEntry[]) if (h.by) actorEmails.add(h.by.toLowerCase());
  }
  const staffUsers = actorEmails.size
    ? await StaffUser.find({ email: { $in: [...actorEmails] } }).select("name email").lean()
    : [];
  const nameByEmail = new Map(staffUsers.map((u) => [u.email.toLowerCase(), u.name || u.email]));
  const who = (email?: string) => (email ? nameByEmail.get(email.toLowerCase()) || email : "Unknown");

  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const spent = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const net = income - spent;

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

  return (
    <OsPage
      title="Transactions"
      subtitle="Every rupee in and out of the company. Income and spends here flow straight into Revenue Overview. Each change is emailed to the founders."
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label={`Income · ${periodLabel}`} value={income} />
        <OsStat label={`Spent · ${periodLabel}`} value={spent} />
        <OsStat label={`Net · ${periodLabel}`} value={`${net < 0 ? "−" : ""}${formatCurrencyINR(Math.abs(net))}`} />
        <OsStat label="Entries" value={String(rows.length)} />
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Type</span>
          <select name="type" defaultValue={typeFilter} className={`${osSelectClass()} w-40`}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Spent</option>
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
        {typeFilter || month ? (
          <Link href="/admin/os/transactions" className="h-11 content-center font-inter text-[13px] text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
            Clear
          </Link>
        ) : null}
      </form>

      <OsTable>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Details</Th>
            <Th>Method</Th>
            <Th>Amount</Th>
            <Th>History</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const history = ((r.history || []) as HistoryEntry[]).slice().reverse();
            const last = history[0];
            const isIncome = r.type === "income";
            return (
              <tr key={String(r._id)}>
                <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
                <Td>
                  <OsBadge tone={isIncome ? "ok" : "bad"}>
                    {TRANSACTION_TYPE_LABELS[r.type as TransactionType]}
                  </OsBadge>
                </Td>
                <Td>
                  <div className="font-medium">{r.title}</div>
                  <div className="mt-0.5 text-xs text-[var(--dash-muted)]">
                    {[r.category, r.party, r.reference].filter(Boolean).join(" · ") || "—"}
                  </div>
                  {r.notes ? <div className="mt-0.5 text-xs text-[var(--dash-faint)]">{r.notes}</div> : null}
                </Td>
                <Td className="whitespace-nowrap">
                  {TRANSACTION_PAYMENT_METHOD_LABELS[r.paymentMethod as TransactionPaymentMethod] || "—"}
                </Td>
                <Td className={`whitespace-nowrap font-medium ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                  {isIncome ? "+" : "−"}
                  {formatCurrencyINR(r.amount)}
                </Td>
                <Td>
                  <details>
                    <summary className="cursor-pointer text-xs text-[var(--dash-muted)]">
                      {last ? `${last.action} · ${formatDate(last.at || r.updatedAt)}` : "—"}
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
                </Td>
                <Td>
                  {canWrite ? (
                    <div className="flex items-center gap-1">
                      <SalesModal
                        triggerLabel="Edit"
                        title="Edit transaction"
                        subtitle="Changes are saved to the history and emailed."
                        triggerClassName="inline-flex h-8 items-center rounded-lg border border-[var(--dash-border)] px-2.5 font-inter text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                      >
                        <OsActionForm action={updateTransaction} submitLabel="Save changes" className="grid gap-3">
                          <input type="hidden" name="id" value={String(r._id)} />
                          <TransactionFields
                            initial={{
                              type: r.type as TransactionType,
                              title: r.title,
                              category: r.category || "",
                              amount: r.amount,
                              date: toDateInputValue(r.date),
                              party: r.party || "",
                              paymentMethod: r.paymentMethod || "upi",
                              reference: r.reference || "",
                              notes: r.notes || "",
                            }}
                          />
                        </OsActionForm>
                      </SalesModal>
                      <RowDeleteButton
                        action={archiveTransaction}
                        id={String(r._id)}
                        confirmMessage={`Delete "${r.title}" (${formatCurrencyINR(r.amount)})?`}
                      />
                    </div>
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
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No transactions {typeFilter || month ? "match these filters" : "yet — add your first income or spend"}.
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-[var(--dash-border)] bg-white p-5">
        <h2 className="mb-4 font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
          Recent changes
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
