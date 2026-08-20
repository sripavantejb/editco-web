export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Invoice } from "@/models/os/Invoice";
import { displayInvoiceStatus } from "@/lib/os/money";
import { INVOICE_STATUS_LABELS } from "@/lib/os/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import {
  PortalCard,
  PortalPageHeader,
} from "@/components/os/portal/ui";

export default async function ClientInvoicesPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const invoices = await Invoice.find({
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    status: { $nin: ["draft", "cancelled"] },
  })
    .sort({ issueDate: -1 })
    .lean();

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Invoices"
        subtitle="Issued invoices you can open and download as PDF."
      />
      <ul className="space-y-3">
        {invoices.map((i) => {
          const st = displayInvoiceStatus({
            status: i.status,
            dueDate: i.dueDate,
            amountPaid: i.amountPaid || 0,
            total: i.total || 0,
          });
          return (
            <li key={String(i._id)}>
              <Link href={`/client-portal/${uuid}/invoices/${i._id}`}>
                <PortalCard className="transition-colors hover:bg-[var(--dash-hover)]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-inter text-base text-[var(--dash-text)]">
                      {i.invoiceNumber}
                    </p>
                    <p className="font-archivo text-lg">
                      {formatCurrencyINR(i.total)}
                    </p>
                  </div>
                  <p className="mt-1 font-inter text-sm text-[var(--dash-muted)]">
                    Due {i.dueDate ? formatDate(i.dueDate) : "—"} ·{" "}
                    {INVOICE_STATUS_LABELS[st]}
                  </p>
                </PortalCard>
              </Link>
            </li>
          );
        })}
      </ul>
      {invoices.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No invoices shared yet.
        </p>
      ) : null}
    </main>
  );
}
