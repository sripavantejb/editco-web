export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { RecurringPayment } from "@/models/os/RecurringPayment";
import {
  RECURRING_PAYMENT_FREQUENCIES,
  RECURRING_PAYMENT_FREQUENCY_LABELS,
  RECURRING_PAYMENT_STATUSES,
} from "@/lib/os/recurring-payments";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { AddRecurringPaymentDrawer } from "@/components/os/AddRecurringPaymentDrawer";
import { OsDateInput } from "@/components/os/OsDateInput";
import { OsSelect } from "@/components/os/OsSelect";
import {
  Field,
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
  osInputClass,
  osTextareaClass,
} from "@/components/os/ui";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import {
  markRecurringPaymentPaid,
  archiveRecurringPayment,
  sendRecurringPaymentReminders,
  updateRecurringPayment,
} from "@/actions/os/recurring-payments";

function toDateInputValue(d: Date | string | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function dueTone(nextDueAt: Date | string, status: string) {
  if (status !== "active") return "neutral" as const;
  const due = new Date(nextDueAt);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const in7 = new Date(now.getTime() + 7 * 86400000);
  if (due < now) return "bad" as const;
  if (due <= in7) return "warn" as const;
  return "ok" as const;
}

export default async function RecurringPaymentsPage() {
  const staff = await requireOsPage("payments:read");
  const canWrite = hasPermission(staff.permissions, "payments:write");

  const rows = await RecurringPayment.find({ recordStatus: "active" })
    .sort({ nextDueAt: 1 })
    .lean();

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const in7 = new Date(now.getTime() + 7 * 86400000);
  const dueSoon = rows.filter(
    (r) => r.status === "active" && new Date(r.nextDueAt) <= in7
  ).length;

  return (
    <OsPage
      title="Recurring payments"
      subtitle="Track recursive / subscription payments and push finance reminders when due."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? (
          <div className="flex flex-wrap items-center gap-2">
            <OsActionForm
              action={sendRecurringPaymentReminders}
              submitLabel={
                dueSoon > 0 ? `Send due reminders (${dueSoon})` : "Send due reminders"
              }
              className="m-0"
            >
              <span className="sr-only">Send finance reminders for due recurring payments</span>
            </OsActionForm>
            <AddRecurringPaymentDrawer />
          </div>
        ) : undefined
      }
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Amount</Th>
            <Th>Frequency</Th>
            <Th>Next due</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r._id)}>
              <Td>
                <div className="font-inter font-medium">{r.title}</div>
                <div className="mt-0.5 text-xs text-[var(--dash-muted)]">
                  {r.payee || "—"}
                  {r.notes ? ` · ${r.notes}` : ""}
                </div>
              </Td>
              <Td>{formatCurrencyINR(r.amount)}</Td>
              <Td>
                {
                  RECURRING_PAYMENT_FREQUENCY_LABELS[
                    r.frequency as keyof typeof RECURRING_PAYMENT_FREQUENCY_LABELS
                  ]
                }
              </Td>
              <Td>
                <OsBadge tone={dueTone(r.nextDueAt, r.status)}>
                  {formatDate(r.nextDueAt)}
                </OsBadge>
                {r.lastPaidAt ? (
                  <div className="mt-1 text-xs text-[var(--dash-muted)]">
                    Last paid {formatDate(r.lastPaidAt)}
                  </div>
                ) : null}
              </Td>
              <Td>{r.status}</Td>
              <Td>
                {canWrite ? (
                  <div className="flex flex-wrap items-start gap-2">
                    {r.status === "active" ? (
                      <OsActionForm
                        action={markRecurringPaymentPaid}
                        submitLabel="Mark paid"
                        className="space-y-1"
                      >
                        <input type="hidden" name="id" value={String(r._id)} />
                      </OsActionForm>
                    ) : null}
                    <details className="rounded-lg border border-[var(--dash-border)] px-2 py-1">
                      <summary className="cursor-pointer font-inter text-xs text-[var(--dash-muted)]">
                        Edit
                      </summary>
                      <div className="mt-2 w-64">
                        <OsActionForm
                          action={updateRecurringPayment}
                          submitLabel="Save"
                          className="space-y-2"
                        >
                          <input type="hidden" name="id" value={String(r._id)} />
                          <input
                            name="title"
                            defaultValue={r.title}
                            required
                            className={osInputClass()}
                          />
                          <input
                            name="payee"
                            defaultValue={r.payee || ""}
                            className={osInputClass()}
                          />
                          <input
                            name="amount"
                            type="number"
                            min="1"
                            step="0.01"
                            defaultValue={r.amount}
                            required
                            className={osInputClass()}
                          />
                          <OsSelect
                            name="frequency"
                            defaultValue={r.frequency}
                            options={RECURRING_PAYMENT_FREQUENCIES.map((f) => ({
                              value: f,
                              label: RECURRING_PAYMENT_FREQUENCY_LABELS[f],
                            }))}
                          />
                          <OsDateInput
                            name="nextDueAt"
                            required
                            defaultValue={toDateInputValue(r.nextDueAt)}
                          />
                          <OsSelect
                            name="status"
                            defaultValue={r.status}
                            options={RECURRING_PAYMENT_STATUSES.map((s) => ({
                              value: s,
                              label: s,
                            }))}
                          />
                          <textarea
                            name="notes"
                            rows={2}
                            defaultValue={r.notes || ""}
                            className={osTextareaClass()}
                          />
                        </OsActionForm>
                      </div>
                    </details>
                    <RowDeleteButton
                      action={archiveRecurringPayment}
                      id={String(r._id)}
                      confirmMessage={`Delete recurring payment "${r.title}"?`}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-[var(--dash-muted)]">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>

      {rows.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No recurring payments yet.
        </p>
      ) : null}
    </OsPage>
  );
}
