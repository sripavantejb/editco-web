export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Payment } from "@/models/os/Payment";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { PortalCard, PortalPageHeader } from "@/components/os/portal/ui";

export default async function ClientPaymentsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const payments = await Payment.find({
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
  })
    .sort({ paidAt: -1 })
    .lean();

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Payments"
        subtitle="Payments recorded against your invoices."
      />
      <ul className="space-y-3 font-inter text-sm">
        {payments.map((p) => (
          <li key={String(p._id)}>
            <PortalCard>
              {formatCurrencyINR(p.amount)} · {formatDate(p.paidAt)} ·{" "}
              {p.reference || p.method}
            </PortalCard>
          </li>
        ))}
      </ul>
      {payments.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No payments yet.
        </p>
      ) : null}
    </main>
  );
}
