export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Invoice } from "@/models/os/Invoice";
import { Vendor } from "@/models/os/Vendor";
import { displayInvoiceStatus } from "@/lib/os/money";
import { PortalPageHeader } from "@/components/os/portal/ui";
import { ClientInvoiceView } from "@/components/os/portal/ClientInvoiceView";

export default async function ClientInvoiceDetailPage({
  params,
}: {
  params: Promise<{ uuid: string; id: string }>;
}) {
  const { uuid, id } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();

  const invoice = await Invoice.findOne({
    _id: id,
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    status: { $nin: ["draft", "cancelled"] },
  }).lean();
  if (!invoice) notFound();

  const vendor = await Vendor.findById(invoice.vendorId).lean();
  const st = displayInvoiceStatus({
    status: invoice.status,
    dueDate: invoice.dueDate,
    amountPaid: invoice.amountPaid || 0,
    total: invoice.total || 0,
  });

  return (
    <main className="px-4 py-10 sm:px-8">
      <Link
        href={`/client-portal/${uuid}/invoices`}
        className="mb-4 inline-block font-inter text-sm text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
      >
        ← Back to invoices
      </Link>
      <PortalPageHeader
        title={invoice.invoiceNumber}
        subtitle={`${st.replace(/_/g, " ")} · view and download`}
      />
      <ClientInvoiceView
        filename={invoice.invoiceNumber}
        data={{
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: st,
          billToName: invoice.billToName || vendor?.companyName || "",
          billToAddress: invoice.billToAddress || vendor?.address || "",
          billToEmail: invoice.billToEmail || vendor?.email || "",
          billToPhone: invoice.billToPhone || vendor?.phone || "",
          billToGst: invoice.billToGst || vendor?.gstNumber || "",
          lineItems: (invoice.lineItems || []).map(
            (item: {
              description: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })
          ),
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          documentNote: invoice.documentNote || "",
        }}
      />
    </main>
  );
}
