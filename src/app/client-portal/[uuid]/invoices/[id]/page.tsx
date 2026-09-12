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
          state: (invoice as any).state || "Karnataka",
          stateCode: (invoice as any).stateCode || "29",
          placeOfSupply: (invoice as any).placeOfSupply || "Karnataka",
          buyerRefNo: (invoice as any).buyerRefNo || "",
          paymentTerms: (invoice as any).paymentTerms || "100% Advance",
          remarks: (invoice as any).remarks || "",
          billToName: invoice.billToName || vendor?.companyName || "",
          billToAddress: invoice.billToAddress || vendor?.address || "",
          billToEmail: invoice.billToEmail || vendor?.email || "",
          billToPhone: invoice.billToPhone || vendor?.phone || "",
          billToGst: invoice.billToGst || vendor?.gstNumber || "",
          billToPan: (invoice as any).billToPan || "",
          billToState: (invoice as any).billToState || "Karnataka",
          billToStateCode: (invoice as any).billToStateCode || "29",
          shipToName: (invoice as any).shipToName || "",
          shipToAddress: (invoice as any).shipToAddress || "",
          shipToGst: (invoice as any).shipToGst || "",
          shipToState: (invoice as any).shipToState || "Karnataka",
          shipToStateCode: (invoice as any).shipToStateCode || "29",
          lineItems: (invoice.lineItems || []).map(
            (item: {
              description: string;
              specifications?: string;
              hsnSac?: string;
              quantity: number;
              uom?: string;
              unitPrice: number;
              discountPercent?: number;
            }) => ({
              description: item.description,
              specifications: item.specifications || "",
              hsnSac: item.hsnSac || "998314",
              quantity: item.quantity,
              uom: item.uom || "Nos",
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || 0,
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
