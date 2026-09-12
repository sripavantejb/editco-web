import type { Ref } from "react";
import Image from "next/image";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { invoiceTotals } from "@/lib/os/money";
import { numberToWordsINR } from "@/lib/os/number-to-words";

export type InvoiceLineItem = {
  description: string;
  specifications?: string;
  hsnSac?: string;
  quantity: number;
  uom?: string; // Nos, Units, Hours, Month, Job, etc.
  unitPrice: number;
  discountPercent?: number;
};

export type InvoiceSheetData = {
  documentType?: "TAX INVOICE" | "INVOICE" | "QUOTATION";
  invoiceNumber?: string;
  issueDate?: string | Date | null;
  dueDate?: string | Date | null;
  documentDate?: string | Date | null;
  status?: string;

  // Issuer / From Details
  fromName?: string;
  fromAddress?: string;
  fromEmail?: string;
  fromPhone?: string;
  fromGst?: string;
  fromPan?: string;
  fromCin?: string;
  fromState?: string;
  fromStateCode?: string;

  // Supply & Reference
  state?: string;
  stateCode?: string;
  placeOfSupply?: string;
  buyerRefNo?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTerms?: string;

  // Bill To Details
  billToName: string;
  billToAddress: string;
  billToEmail?: string;
  billToPhone?: string;
  billToGst?: string;
  billToPan?: string;
  billToState?: string;
  billToStateCode?: string;

  // Ship To Details
  shipToName?: string;
  shipToAddress?: string;
  shipToGst?: string;
  shipToState?: string;
  shipToStateCode?: string;

  // Items & Calculations
  lineItems: InvoiceLineItem[];
  taxRate: number; // e.g. 0.18
  discount: number; // ₹ overall discount
  isInterState?: boolean;

  // Bottom notes & bank details
  documentNote?: string;
  remarks?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountType?: string;
  bankUpi?: string;
};

const DEFAULT_COMPANY = {
  fromName: "Editco Media Private Limited",
  fromAddress: "Indiranagar, 100 Feet Road, Bengaluru - 560038, Karnataka, India",
  fromEmail: "team@editcomedia.com",
  fromPhone: "+91 91103 47443",
  fromGst: "29AABCE1234A1Z5",
  fromPan: "AABCE1234A",
  fromCin: "U74999KA2023PTC123456",
  fromState: "Karnataka",
  fromStateCode: "29",
  bankName: "HDFC Bank",
  bankAccountName: "Editco Media Private Limited",
  bankAccountNumber: "50200084930219",
  bankIfsc: "HDFC0001234",
  bankAccountType: "Current Account",
  bankUpi: "editco@hdfcbank",
};

const LOGO_IMG =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

export function InvoiceSheet({
  data,
  className = "",
  sheetRef,
}: {
  data: InvoiceSheetData;
  className?: string;
  sheetRef?: Ref<HTMLDivElement>;
}) {
  const comp = { ...DEFAULT_COMPANY, ...data };
  const items = data.lineItems.filter((i) => i.description.trim());
  const isInterState = Boolean(data.isInterState);

  const totals = invoiceTotals({
    lineItems: items,
    taxRate: data.taxRate,
    discount: data.discount,
    isInterState,
  });

  const issue =
    data.issueDate && String(data.issueDate)
      ? formatDate(data.issueDate)
      : "—";
  const due =
    data.dueDate && String(data.dueDate) ? formatDate(data.dueDate) : "—";
  const docDate =
    data.documentDate && String(data.documentDate)
      ? formatDate(data.documentDate)
      : issue;

  const statusLabel = data.status
    ? data.status.replace(/_/g, " ")
    : null;

  const documentType = data.documentType || "TAX INVOICE";
  const amountInWords = numberToWordsINR(totals.total);

  const totalQty = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div
      ref={sheetRef}
      className={`invoice-sheet relative overflow-hidden bg-white text-[#111827] shadow-[0_20px_60px_rgba(0,0,0,0.18)] print:shadow-none ${className}`}
      style={{
        width: 794,
        minHeight: 1123,
        boxSizing: "border-box",
      }}
    >
      {/* Background Watermark (Ultra-light, subtle, crisp vector, decreased opacity as requested) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative h-[380px] w-[380px] opacity-[0.038] grayscale contrast-125 select-none">
          <Image
            src={LOGO_IMG}
            alt="Watermark"
            fill
            sizes="380px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Main Document Content */}
      <div className="relative z-10 flex min-h-[1123px] flex-col p-8 font-sans text-[11px] leading-tight">
        {/* Top Header Row */}
        <header className="flex items-start justify-between border-b border-[#111827] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative h-12 w-12 shrink-0 rounded-lg bg-[#0d0d12] p-1.5 shadow-sm">
              <Image
                src={LOGO_IMG}
                alt="Editco Logo"
                fill
                sizes="48px"
                className="object-contain p-1 invert"
                priority
              />
            </div>
            <div>
              <h1 className="text-[17px] font-black uppercase tracking-tight text-[#0d0d12]">
                {comp.fromName}
              </h1>
              <p className="text-[10px] text-[#4b5563] mt-0.5 max-w-[340px] leading-snug">
                {comp.fromAddress}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#374151] space-y-0.5 max-w-[280px]">
            <p>
              <span className="font-semibold text-[#111827]">Email:</span>{" "}
              {comp.fromEmail}
            </p>
            <p>
              <span className="font-semibold text-[#111827]">Phone:</span>{" "}
              {comp.fromPhone}
            </p>
            <p className="tracking-wide">
              <span className="font-semibold text-[#111827]">PAN:</span> {comp.fromPan}{" "}
              | <span className="font-semibold text-[#111827]">GSTIN:</span> {comp.fromGst}
            </p>
            {comp.fromCin ? (
              <p className="tracking-wide">
                <span className="font-semibold text-[#111827]">CIN:</span> {comp.fromCin}
              </p>
            ) : null}
          </div>
        </header>

        {/* Title Badge Bar */}
        <div className="relative my-2.5 flex items-center justify-center border-y border-[#111827] bg-[#f9fafb] py-1.5">
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#111827]">
            {documentType}
          </span>
          {statusLabel ? (
            <span className="absolute right-2 rounded border border-[#9ca3af] bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#374151]">
              {statusLabel}
            </span>
          ) : null}
        </div>

        {/* 2-Column Document Metadata Grid */}
        <div className="grid grid-cols-2 border border-[#111827] text-[10px]">
          {/* Column 1 */}
          <div className="divide-y divide-[#e5e7eb] border-r border-[#111827]">
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Invoice / Doc No.</span>
              <span className="font-bold text-[#111827]">
                : {data.invoiceNumber || "DRAFT"}
              </span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Issue / Quote Date</span>
              <span className="font-semibold text-[#111827]">: {issue}</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">State / State Code</span>
              <span className="text-[#111827]">
                : {data.state || comp.fromState || "Karnataka"} (Code: {data.stateCode || comp.fromStateCode || "29"})
              </span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Place of Supply</span>
              <span className="text-[#111827]">
                : {data.placeOfSupply || data.state || "Karnataka"}
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="divide-y divide-[#e5e7eb]">
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Due Date</span>
              <span className="font-semibold text-[#111827]">: {due}</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Document Date</span>
              <span className="text-[#111827]">: {docDate}</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Buyer Ref / PO No.</span>
              <span className="text-[#111827]">
                : {data.buyerRefNo || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[110px_1fr] px-2.5 py-1">
              <span className="font-medium text-[#4b5563]">Payment Terms</span>
              <span className="text-[#111827]">
                : {data.paymentTerms || "100% Advance"}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Bill To & Ship To Boxes */}
        <div className="mt-[-1px] grid grid-cols-2 border border-[#111827] text-[10px]">
          {/* Customer / Bill To */}
          <div className="border-r border-[#111827] p-2.5">
            <p className="border-b border-[#d1d5db] pb-1 font-bold uppercase tracking-wider text-[#111827]">
              Customer / Bill To
            </p>
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[11px] font-bold text-[#111827]">
                {data.billToName || "—"}
              </p>
              <p className="whitespace-pre-line text-[#4b5563] leading-snug">
                {data.billToAddress || "Address not provided"}
              </p>
              <div className="pt-1 text-[#374151] flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  <strong className="text-[#111827]">State:</strong> {data.billToState || data.state || "Karnataka"}
                </span>
                <span>
                  <strong className="text-[#111827]">Code:</strong> {data.billToStateCode || data.stateCode || "29"}
                </span>
              </div>
              <p className="text-[#374151]">
                <strong className="text-[#111827]">GSTIN:</strong>{" "}
                {data.billToGst || "—"}
                {data.billToPan ? (
                  <>
                    {" "} | <strong className="text-[#111827]">PAN:</strong> {data.billToPan}
                  </>
                ) : null}
              </p>
              {data.billToEmail || data.billToPhone ? (
                <p className="text-[#6b7280]">
                  {[data.billToEmail, data.billToPhone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          {/* Ship To Details */}
          <div className="p-2.5">
            <p className="border-b border-[#d1d5db] pb-1 font-bold uppercase tracking-wider text-[#111827]">
              Ship To Details
            </p>
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[11px] font-bold text-[#111827]">
                {data.shipToName || data.billToName || "—"}
              </p>
              <p className="whitespace-pre-line text-[#4b5563] leading-snug">
                {data.shipToAddress || data.billToAddress || "Same as Bill To Address"}
              </p>
              <div className="pt-1 text-[#374151] flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  <strong className="text-[#111827]">State:</strong> {data.shipToState || data.billToState || data.state || "Karnataka"}
                </span>
                <span>
                  <strong className="text-[#111827]">Code:</strong> {data.shipToStateCode || data.billToStateCode || data.stateCode || "29"}
                </span>
              </div>
              <p className="text-[#374151]">
                <strong className="text-[#111827]">GSTIN:</strong>{" "}
                {data.shipToGst || data.billToGst || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* GST Commercial Itemized Table */}
        <div className="mt-[-1px] flex-1">
          <table className="w-full border-collapse border border-[#111827] text-[10px]">
            <thead>
              <tr className="bg-[#111827] text-white">
                <th className="border-r border-white/20 py-1.5 px-1.5 text-center font-bold w-7">
                  Sr.
                </th>
                <th className="border-r border-white/20 py-1.5 px-2 text-left font-bold min-w-[140px]">
                  Description
                </th>
                <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-14">
                  HSN/SAC
                </th>
                <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-10">
                  Qty
                </th>
                <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-10">
                  UOM
                </th>
                <th className="border-r border-white/20 py-1.5 px-1.5 text-right font-bold w-16">
                  Rate (₹)
                </th>
                <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-11">
                  Disc %
                </th>
                <th className="border-r border-white/20 py-1.5 px-1.5 text-right font-bold w-18">
                  Taxable
                </th>
                {!isInterState ? (
                  <>
                    <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-10">
                      CGST%
                    </th>
                    <th className="border-r border-white/20 py-1.5 px-1.5 text-right font-bold w-14">
                      CGST Amt
                    </th>
                    <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-10">
                      SGST%
                    </th>
                    <th className="border-r border-white/20 py-1.5 px-1.5 text-right font-bold w-14">
                      SGST Amt
                    </th>
                  </>
                ) : (
                  <>
                    <th className="border-r border-white/20 py-1.5 px-1 text-center font-bold w-12">
                      IGST%
                    </th>
                    <th className="border-r border-white/20 py-1.5 px-1.5 text-right font-bold w-20">
                      IGST Amt
                    </th>
                  </>
                )}
                <th className="py-1.5 px-2 text-right font-bold w-20">
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={isInterState ? 9 : 11}
                    className="py-10 text-center text-[#9ca3af] italic"
                  >
                    No line items added yet. Items added on the left will appear here.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const qty = item.quantity || 1;
                  const unitPrice = item.unitPrice || 0;
                  const gross = qty * unitPrice;
                  const discPct = item.discountPercent || 0;
                  const lineDisc = Math.round((gross * discPct) / 100);
                  const taxable = gross - lineDisc;
                  const r = data.taxRate || 0.18;

                  const cgstAmt = Math.round((taxable * (r / 2)));
                  const sgstAmt = Math.round((taxable * (r / 2)));
                  const igstAmt = Math.round(taxable * r);
                  const lineTotal = isInterState
                    ? taxable + igstAmt
                    : taxable + cgstAmt + sgstAmt;

                  return (
                    <tr key={index} className="hover:bg-[#f9fafb]/50">
                      <td className="border-r border-[#111827] py-2 px-1 text-center text-[#4b5563] font-medium align-top">
                        {index + 1}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-2 text-left align-top">
                        <p className="font-semibold text-[#111827] leading-tight">
                          {item.description}
                        </p>
                        {item.specifications ? (
                          <p className="mt-0.5 text-[9px] text-[#6b7280] leading-snug">
                            {item.specifications}
                          </p>
                        ) : null}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1 text-center text-[#4b5563] align-top">
                        {item.hsnSac || "998314"}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1 text-center text-[#111827] font-semibold align-top">
                        {qty}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1 text-center text-[#6b7280] align-top">
                        {item.uom || "Nos"}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1.5 text-right text-[#111827] font-medium align-top">
                        {formatCurrencyINR(unitPrice)}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1 text-center text-[#6b7280] align-top">
                        {discPct > 0 ? `${discPct}%` : "0"}
                      </td>
                      <td className="border-r border-[#111827] py-2 px-1.5 text-right font-medium text-[#111827] align-top">
                        {formatCurrencyINR(taxable)}
                      </td>
                      {!isInterState ? (
                        <>
                          <td className="border-r border-[#111827] py-2 px-1 text-center text-[#4b5563] align-top">
                            {Math.round((r / 2) * 100)}%
                          </td>
                          <td className="border-r border-[#111827] py-2 px-1.5 text-right text-[#374151] align-top">
                            {formatCurrencyINR(cgstAmt)}
                          </td>
                          <td className="border-r border-[#111827] py-2 px-1 text-center text-[#4b5563] align-top">
                            {Math.round((r / 2) * 100)}%
                          </td>
                          <td className="border-r border-[#111827] py-2 px-1.5 text-right text-[#374151] align-top">
                            {formatCurrencyINR(sgstAmt)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border-r border-[#111827] py-2 px-1 text-center text-[#4b5563] align-top">
                            {Math.round(r * 100)}%
                          </td>
                          <td className="border-r border-[#111827] py-2 px-1.5 text-right text-[#374151] align-top">
                            {formatCurrencyINR(igstAmt)}
                          </td>
                        </>
                      )}
                      <td className="py-2 px-2 text-right font-bold text-[#111827] align-top">
                        {formatCurrencyINR(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Column Totals Row */}
            <tfoot>
              <tr className="border-t border-[#111827] bg-[#f9fafb] font-bold text-[#111827]">
                <td colSpan={3} className="border-r border-[#111827] py-1.5 px-2 text-left">
                  Total
                </td>
                <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                  {totalQty}
                </td>
                <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                  —
                </td>
                <td className="border-r border-[#111827] py-1.5 px-1.5 text-right">
                  —
                </td>
                <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                  —
                </td>
                <td className="border-r border-[#111827] py-1.5 px-1.5 text-right">
                  {formatCurrencyINR(totals.taxable)}
                </td>
                {!isInterState ? (
                  <>
                    <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                      —
                    </td>
                    <td className="border-r border-[#111827] py-1.5 px-1.5 text-right">
                      {formatCurrencyINR(totals.cgstAmount)}
                    </td>
                    <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                      —
                    </td>
                    <td className="border-r border-[#111827] py-1.5 px-1.5 text-right">
                      {formatCurrencyINR(totals.sgstAmount)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border-r border-[#111827] py-1.5 px-1 text-center">
                      —
                    </td>
                    <td className="border-r border-[#111827] py-1.5 px-1.5 text-right">
                      {formatCurrencyINR(totals.igstAmount)}
                    </td>
                  </>
                )}
                <td className="py-1.5 px-2 text-right text-[#0d0d12]">
                  {formatCurrencyINR(totals.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Split Section: Notes/Remarks/Words + Totals Summary */}
        <div className="mt-[-1px] grid grid-cols-[1fr_270px] border border-[#111827] text-[10px]">
          {/* Left Block */}
          <div className="divide-y divide-[#111827] border-r border-[#111827]">
            {/* Remarks */}
            <div className="p-2.5">
              <span className="font-bold uppercase tracking-wider text-[#111827]">
                Remarks / Scope:
              </span>
              <p className="mt-0.5 whitespace-pre-line text-[#4b5563] leading-snug">
                {data.remarks || data.documentNote || "Services delivered as per agreed project milestone and deliverables."}
              </p>
            </div>

            {/* Amount in Words */}
            <div className="p-2.5 bg-[#f9fafb]/60">
              <span className="font-bold uppercase tracking-wider text-[#111827]">
                Amount In Words:
              </span>
              <p className="mt-0.5 font-bold text-[#111827] text-[10.5px]">
                {amountInWords}
              </p>
            </div>

            {/* Bank Remittance Details & Terms */}
            <div className="grid grid-cols-2 divide-x divide-[#e5e7eb] p-2.5">
              <div>
                <p className="font-bold uppercase tracking-wider text-[#111827] mb-1">
                  Bank Details for Payment
                </p>
                <div className="space-y-0.5 text-[#374151]">
                  <p>
                    <strong>Bank:</strong> {comp.bankName}
                  </p>
                  <p>
                    <strong>A/C Name:</strong> {comp.bankAccountName}
                  </p>
                  <p>
                    <strong>A/C No:</strong> {comp.bankAccountNumber}
                  </p>
                  <p>
                    <strong>IFSC:</strong> {comp.bankIfsc} ({comp.bankAccountType})
                  </p>
                  <p>
                    <strong>UPI:</strong> {comp.bankUpi}
                  </p>
                </div>
              </div>

              <div className="pl-2.5">
                <p className="font-bold uppercase tracking-wider text-[#111827] mb-1">
                  Terms & Conditions
                </p>
                <ul className="list-disc pl-3 text-[#6b7280] space-y-0.5 leading-tight">
                  <li>Payment due within agreed credit period.</li>
                  <li>18% per annum interest charged on delayed payments.</li>
                  <li>All disputes subject to Bengaluru jurisdiction.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Block: Totals Table */}
          <div className="divide-y divide-[#e5e7eb] text-[10px]">
            <div className="flex justify-between px-3 py-1.5">
              <span className="text-[#4b5563]">Total Amount Before Tax</span>
              <span className="font-medium text-[#111827]">
                {formatCurrencyINR(totals.taxable)}
              </span>
            </div>

            {totals.discount > 0 ? (
              <div className="flex justify-between px-3 py-1.5 text-emerald-700">
                <span>Total Discount</span>
                <span className="font-medium">−{formatCurrencyINR(totals.discount)}</span>
              </div>
            ) : null}

            {!isInterState ? (
              <>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-[#4b5563]">
                    Add: CGST ({Math.round(totals.cgstRate * 100)}%)
                  </span>
                  <span className="font-medium text-[#111827]">
                    {formatCurrencyINR(totals.cgstAmount)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-[#4b5563]">
                    Add: SGST ({Math.round(totals.sgstRate * 100)}%)
                  </span>
                  <span className="font-medium text-[#111827]">
                    {formatCurrencyINR(totals.sgstAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between px-3 py-1.5">
                <span className="text-[#4b5563]">
                  Add: IGST ({Math.round(totals.igstRate * 100)}%)
                </span>
                <span className="font-medium text-[#111827]">
                  {formatCurrencyINR(totals.igstAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between px-3 py-1.5 bg-[#f9fafb]">
              <span className="font-semibold text-[#374151]">Total GST</span>
              <span className="font-bold text-[#111827]">
                {formatCurrencyINR(totals.taxAmount)}
              </span>
            </div>

            <div className="flex justify-between px-3 py-1.5">
              <span className="text-[#6b7280]">Rounding</span>
              <span className="text-[#6b7280]">
                {totals.rounding >= 0 ? `+` : `−`}
                {formatCurrencyINR(Math.abs(totals.rounding))}
              </span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-[#111827] bg-[#111827] px-3 py-2 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Amount
              </span>
              <span className="text-[13px] font-black tracking-tight">
                {formatCurrencyINR(totals.total)}
              </span>
            </div>

            {/* Authorized Signatory Block */}
            <div className="p-3 text-center flex flex-col justify-between min-h-[90px]">
              <p className="text-[9.5px] font-bold uppercase text-[#374151]">
                For {comp.fromName}
              </p>
              <div className="mt-8 border-t border-dashed border-[#9ca3af] pt-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="mt-3 flex items-center justify-between text-[9px] text-[#9ca3af]">
          <span>This is a computer-generated tax document.</span>
          <span>Editco Media · Bangalore, India</span>
        </footer>
      </div>
    </div>
  );
}
